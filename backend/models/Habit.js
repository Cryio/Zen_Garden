const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the habit'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  category: {
    type: String,
    enum: ['health', 'learning', 'mindfulness', 'productivity', 'self-care', 'finance', 'social', 'organization', 'hobby'],
    default: 'health'
  },
  completed: {
    type: Boolean,
    default: false,
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  streak: {
    type: Number,
    default: 0
  },
  lastCompleted: {
    type: Date,
    default: null
  },
  completionHistory: {
    type: [Date],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

// Update the updatedAt field before saving
habitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Habit', habitSchema); 