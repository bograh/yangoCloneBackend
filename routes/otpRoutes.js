
const express = require('express');
const { sendOTP, verifyOTP, resendOTP, limiter } = require('../controllers/otpController');
const router = express.Router();

// Apply the rate limiter to all OTP routes
router.use(limiter);

router.post('/sendOTP', async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  if (!phoneNumber) {
    console.log('Missing phone number');
    return res.json({ message: 'Phone number is required' });
  }
  const data = await sendOTP(phoneNumber);
  if (data === 'Internal Server Error') {
    console.log('Failed to send OTP');
    return res.json({ message: 'Failed to send OTP' });
  }
  console.log('OTP sent successfully, requestId:', data.requestId);
  return res.json({
    message: 'OTP sent successfully',
    code: '200',
    data
  });
});


router.post('/verifyOTP', async (req, res) => {
  const requestId = req.body.requestId;
  const prefix = req.body.prefix;
  const code  = req.body.code;

  if (!requestId || !prefix || !code) {
    console.log('Missing requestId, prefix or code');
    return res.json({ message: 'requestId, prefix and code are required' });
  }
  const result = await verifyOTP(requestId, prefix, code);
  if (result === 'Invalid OTP') {
    console.log('Invalid OTP');
    return res.json({ message: 'Invalid OTP' });
  }
  console.log('OTP verified successfully');
  return res.json({ message: result });
});


router.post('/resendOTP', async (req, res) => {
  const requestId = req.body.requestId;
  if (!requestId) {
    console.log('Missing requestId');
    return res.json({ message: 'requestId is required' });
  }
  const result = await resendOTP(requestId);
  if (result === 'Failed to resend OTP') {
    console.log('Failed to resend OTP');
    return res.json({ message: 'Failed to resend OTP' });
  }
  console.log('OTP resent successfully');
  return res.json({ message: result });
});

module.exports = router;