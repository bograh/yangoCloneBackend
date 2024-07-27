const express = require('express');
const { registerUser, loginUser, verifyUserOTP, resendUserOTP, logout, registerDriver } = require('../controllers/authController');
const { limiter } = require('../utils/otpHelper');
const router = express.Router();

router.post('/user/signup', limiter, registerUser);
router.post('/user/login', limiter, loginUser);
router.post('/driver/signup', limiter, registerDriver);
router.post('/verify-otp', limiter, verifyUserOTP);
router.post('/resend-otp', limiter, resendUserOTP);
router.post('/logout', logout);

module.exports = router;
