// routes/analytics.js
const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');

// Get analytics for a user
router.get('/:userId', async (req, res) => {
  try {
    const analytics = await Analytics.findOne({ userId: req.params.userId });
    res.json(analytics || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Update analytics for a user
router.post('/:userId', async (req, res) => {
  try {
    const data = req.body;
    const updated = await Analytics.findOneAndUpdate(
      { userId: req.params.userId },
      { ...data, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update analytics data' });
  }
});

module.exports = router;
