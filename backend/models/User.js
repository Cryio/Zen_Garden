const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require('validator');
const crypto = require('crypto');

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
    validate: [validator.isEmail, "Please enter a valid email"]
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
    minlength: [8, "Password must be at least 8 characters long"],
    select: false // Don't include password in query results
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
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
  goals: {
    type: [{
      id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      habits: [{
        id: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true,
          trim: true
        },
        description: {
          type: String,
          trim: true
        },
        completed: {
          type: Boolean,
          default: false
        },
        streak: {
          type: Number,
          default: 0
        },
        completionHistory: {
          type: [Boolean],
          default: Array(7).fill(false)
        },
        frequency: {
          type: String,
          enum: ['daily', 'weekly', 'monthly'],
          default: 'daily'
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
        updatedAt: {
          type: Date,
          default: Date.now
        }
      }],
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  stats: {
    type: {
      totalGoals: {
        type: Number,
        default: 0
      },
      totalHabits: {
        type: Number,
        default: 0
      },
      completedHabits: {
        type: Number,
        default: 0
      },
      currentStreak: {
        type: Number,
        default: 0
      },
      bestStreak: {
        type: Number,
        default: 0
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    },
    default: {}
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
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
UserSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return resetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
