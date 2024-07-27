const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const { admin, db } = require('./config/firebaseConfig'); 
const { sendOTP, verifyOTP, resendOTP } = require('./utils/otpHelper');
const authRoutes = require('./routes/authRoutes');

// Initialize Express application
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Rate limiter middleware for OTP requests
const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many OTP requests created from this IP, please try again after 15 minutes'
});

app.use('/api/auth', otpRateLimiter);

// Use auth routes
app.use('/api/auth', authRoutes);

// Example of how to handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
