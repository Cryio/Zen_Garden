const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config(); // Load .env variables

const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, gender, dob, password } = req.body;

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
      dob,
      password // Save hashed password
    });

    await newUser.save();

    // Generate JWT token using secret from .env
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Compare password directly
    if (existingUser.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Generate JWT token
    const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    // 4. Send token
    res.status(200).json({ message: "Login successful", token });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


  module.exports = router;
