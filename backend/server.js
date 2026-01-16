const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Try MongoDB connection with retries
let mongoConnected = false;
let retryCount = 0;
const MAX_RETRIES = 10;

console.log('🔄 Connecting to MongoDB...');
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
    });
    mongoConnected = true;
    retryCount = 0;
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Using MongoDB database for all data\n');
  } catch (err) {
    mongoConnected = false;
    retryCount++;
    console.log(`❌ MongoDB connection attempt ${retryCount}/${MAX_RETRIES} failed: ${err.message}`);

    if (retryCount < MAX_RETRIES) {
      console.log(`⏳ Retrying in 5 seconds...\n`);
      setTimeout(connectMongoDB, 5000);
    } else {
      console.log('⚠️ Max retries reached - MongoDB connection failed');
      console.log('📁 Using local storage as fallback\n');
    }
  }
};

connectMongoDB();

// Try to reconnect if MongoDB disconnects
mongoose.connection.on('disconnected', () => {
  mongoConnected = false;
  console.log('⚠️ MongoDB disconnected - attempting to reconnect...');
  setTimeout(connectMongoDB, 5000);
});

const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const sessionRoutes = require('./routes/sessions');
const authFlowRoutes = require('./routes/authFlow');

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/auth-flow', authFlowRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    mongoConnected: mongoConnected,
    database: mongoConnected ? 'MongoDB' : 'Local JSON Storage',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
});
