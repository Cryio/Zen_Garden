const mongoose = require("mongoose");

const FocusModeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  habitId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Habit", 
    required: false 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true 
  }, // in minutes
  type: {
    type: String,
    enum: ['pomodoro', 'break', 'long-break'],
    default: 'pomodoro'
  },
  completed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  interruptions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("FocusMode", FocusModeSchema); 