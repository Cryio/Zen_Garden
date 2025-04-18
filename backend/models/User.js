const mongoose = require("mongoose");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: [true, "First name is required"],
    trim: true
  },
  lastName: { 
    type: String, 
    required: [true, "Last name is required"],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  gender: { 
    type: String, 
    required: [true, "Gender is required"],
    enum: ["male", "female", "other"]
  },
  dob: { 
    type: Date, 
    required: [true, "Date of birth is required"]
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"]
  },
  bio: {
    type: String,
    default: '',
    trim: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  gardenPreference: {
    type: String,
    enum: ['zen', 'cottage', 'modern'],
    default: 'zen'
  },
  notifications: {
    type: Boolean,
    default: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
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
