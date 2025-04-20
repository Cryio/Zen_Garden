const express = require("express");
const router = express.Router();
const FocusMode = require("../models/FocusMode");
const { verifyToken } = require('./auth');

// Start a new focus/pomodoro session
router.post("/:userId/focus", verifyToken, async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const { startTime, endTime, duration, habitId, type, notes } = req.body;
    const focusSession = new FocusMode({
      userId: req.params.userId,
      startTime,
      endTime,
      duration,
      habitId: habitId || null,
      type: type || 'pomodoro',
      notes
    });
    
    await focusSession.save();
    res.status(201).json(focusSession);
  } catch (error) {
    console.error('Error creating focus session:', error);
    res.status(500).json({ message: 'Failed to save focus session' });
  }
});

// Get all focus sessions for a user
router.get("/:userId/focus", verifyToken, async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const sessions = await FocusMode.find({ userId: req.params.userId })
      .sort({ startTime: -1 })
      .populate('habitId', 'name');
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    res.status(500).json({ message: 'Failed to fetch focus sessions' });
  }
});

// Update a focus session (mark as completed, add interruptions, etc.)
router.put("/:userId/focus/:sessionId", verifyToken, async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const session = await FocusMode.findOne({
      _id: req.params.sessionId,
      userId: req.params.userId
    });

    if (!session) {
      return res.status(404).json({ message: 'Focus session not found' });
    }

    const updatedSession = await FocusMode.findByIdAndUpdate(
      req.params.sessionId,
      { 
        $set: req.body,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(updatedSession);
  } catch (error) {
    console.error('Error updating focus session:', error);
    res.status(500).json({ message: 'Failed to update focus session' });
  }
});

// Get focus session statistics
router.get("/:userId/focus/stats", verifyToken, async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const timeframe = req.query.timeframe || 'week'; // 'day', 'week', 'month'
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const stats = await FocusMode.aggregate([
      {
        $match: {
          userId: req.params.userId,
          startTime: { $gte: startDate },
          completed: true
        }
      },
      {
        $group: {
          _id: "$type",
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: "$duration" },
          avgInterruptions: { $avg: "$interruptions" }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching focus statistics:', error);
    res.status(500).json({ message: 'Failed to fetch focus statistics' });
  }
});

module.exports = router; 