const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require("dotenv").config(); // Load .env variables
const passport = require("passport");

const router = express.Router();

// Create nodemailer transporter with better error handling
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Verify transporter configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.error("Email transporter verification failed:", error);
    } else {
      console.log("Email transporter is ready to send messages");
    }
  });
} catch (error) {
  console.error("Failed to create email transporter:", error);
}

// Google OAuth Routes
router.get('/google',
  (req, res, next) => {
    // Store the original URL in the session
    req.session.returnTo = req.query.returnTo || '/dashboard';
    // Save the session before continuing
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
      }
      next();
    });
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: true // Enable session support
  }),
  async (req, res) => {
    try {
      // Generate JWT token
      const authToken = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Get the frontend URL from environment variables with fallback
      const frontendUrl = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Get returnTo URL from session or user object
      const returnTo = req.user.returnTo || req.session.returnTo || '/dashboard';
      
      // Construct the redirect URL
      const redirectUrl = `${frontendUrl}/auth/callback?token=${authToken}&returnTo=${encodeURIComponent(returnTo)}`;
      
      // Clear the returnTo URL from both session and user object
      req.session.returnTo = null;
      if (req.user) {
        req.user.returnTo = null;
      }
      
      // Save the session before redirecting
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session:', err);
        }
        res.redirect(redirectUrl);
      });
    } catch (error) {
      console.error('Error in Google callback:', error);
      const frontendUrl = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Check if email configuration is set up
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env");
      return res.status(500).json({ error: "Email service not configured" });
    }

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your Zen Garden account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: "Password reset email sent" });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // If email fails, still return success but log the error
      res.json({ 
        message: "Password reset email sent", 
        warning: "Email delivery may be delayed" 
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    // Return more specific error message
    res.status(500).json({ 
      error: "Failed to process password reset request",
      details: error.message 
    });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }

    if (!password) {
      return res.status(400).json({ error: "New password is required" });
    }

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    try {
      await user.save();
      res.json({ message: "Password reset successful" });
    } catch (saveError) {
      console.error("Error saving new password:", saveError);
      res.status(500).json({ error: "Failed to save new password" });
    }
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ 
      error: "Failed to reset password",
      details: error.message 
    });
  }
});

// Get current user data
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, gender, dob, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !gender || !dob || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      gender,
      dob: new Date(dob),
      password
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ 
      message: "User registered successfully", 
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error("Signup Error:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, email, bio, theme, gardenPreference, notifications, timezone } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.theme = theme || user.theme;
    user.gardenPreference = gardenPreference || user.gardenPreference;
    user.notifications = notifications !== undefined ? notifications : user.notifications;
    user.timezone = timezone || user.timezone;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user account
router.delete("/delete-account", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Delete user and all associated data
    await User.findByIdAndDelete(userId);
    
    // Clear any user-related data from the session
    res.clearCookie('token');
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = { router, verifyToken };
