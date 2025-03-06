const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();

// User Signup (Handles Both Local & Google OAuth Signups)
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, gender, dob, password, googleId, authProvider } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    let newUser;

    // If signing up with Google OAuth
    if (authProvider === "google") {
      newUser = new User({
        firstName,
        lastName,
        email,
        gender,
        dob,
        googleId,
        authProvider: "google",
      });

    } else if (authProvider === "local") { // If signing up normally (email & password)
      if (!password) {
        return res.status(400).json({ error: "Password is required for local signup" });
      }

      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      newUser = new User({
        firstName,
        lastName,
        email,
        gender,
        dob,
        password: hashedPassword,
        authProvider: "local",
      });
    } else {
      return res.status(400).json({ error: "Invalid auth provider" });
    }

    await newUser.save();

    // Generate JWT Token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered successfully", token });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
