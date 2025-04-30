const express = require("express");
const cors = require("cors");
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/database');
const habitRoutes = require('./routes/habit');
const { router: authRoutes } = require('./routes/auth');
const chatbotRoutes = require("./routes/chatbot");
const focusModeRoutes = require('./routes/focusMode');
const seedRoutes = require('./routes/seed');
require('dotenv').config();

require('./config/passport');

const app = express();

// Connect to database
connectDB();

// Get the frontend URL from environment variables with fallback
const frontendUrl = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    if (origin === frontendUrl) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    frontendUrl,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/habits', habitRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use('/api/focus', focusModeRoutes);
app.use('/api/seed', seedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL: ${frontendUrl}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
