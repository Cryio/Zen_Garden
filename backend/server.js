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
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('./config/passport');

const app = express();

// Connect to database
connectDB();

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/habits', habitRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use('/api/focus', focusModeRoutes);
app.use('/api/seed', seedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
