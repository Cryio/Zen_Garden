const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get habits for a user
router.get("/:userId/habits", async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId });
  res.json(user.habits);
});

// Add a new habit
router.post("/:userId/habits", async (req, res) => {
  const user = await User.findById(req.params.userId);
  user.habits.push(req.body);
  await user.save();
  res.status(201).json(user.habits);
});

// Update stats
router.put("/:userId/stats", async (req, res) => {
  const user = await User.findById(req.params.userId);
  user.stats = req.body;
  await user.save();
  res.json(user.stats);
});

module.exports = router;
