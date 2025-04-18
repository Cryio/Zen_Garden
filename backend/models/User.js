const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true }, 
  password: { type: String, required: true }//hashed from the front end
});

const HabitSchema = new mongoose.Schema({
  habitName: String,
  streak: Number,
  progress: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StatsSchema = new mongoose.Schema({
  completionRate: Number,
  currentStreak: Number,
  bestStreak: Number,
  focusTime: Number,
  totalHabits: Number,
  activeHabits: Number,
  dailyProgress: Number,
  weeklyOverview: Number,
  monthlyAnalytics: Number,
});

module.exports = mongoose.model("User", UserSchema);
