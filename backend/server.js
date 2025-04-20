const express = require("express");
const cors = require("cors");
const connectDB = require('./config/database');
const habitRoutes = require('./routes/habit');
const { router: authRoutes } = require('./routes/auth');
const chatbotRoutes = require("./routes/chatbot");

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/habits', habitRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/chatbot", chatbotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
