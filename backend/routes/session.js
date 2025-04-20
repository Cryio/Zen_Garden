const express = require("express");
const router = express.Router();
const Session = require("../models/Session");

// Save a Pomodoro session
router.post("/:userId/session", async (req, res) => {
  try {
    const { startTime, endTime, duration, habitId } = req.body;
    const session = new Session({
      userId: req.params.userId,
      startTime,
      endTime,
      duration,
      habitId: habitId || null
    });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to save session" });
  }
});

// Fetch sessions by user
router.get("/:userId/sessions", async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

module.exports = router;
