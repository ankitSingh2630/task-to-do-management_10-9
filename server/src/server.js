const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const path = require('path');

// Load environment variables from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Also load from current working directory if available
dotenv.config();

// Default fallbacks if env vars are missing
process.env.MONGODB_URI = process.env.MONGODB_URI || '';
process.env.JWT_SECRET = process.env.JWT_SECRET || '';

// Connect to MongoDB
connectDB();

const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true), // Dynamic origin allowing credentials
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Task Management API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
