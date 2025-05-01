// models/Analytics.js
const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalHabits: { type: Number, default: 0 },
  completedHabits: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  mostConsistentHabit: { type: String, default: '' },
  categoryStats: {
    Work: { type: Number, default: 0 },
    Personal: { type: Number, default: 0 },
    Fitness: { type: Number, default: 0 },
    Learning: { type: Number, default: 0 },
    Shopping: { type: Number, default: 0 },
    Others: { type: Number, default: 0 },
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
