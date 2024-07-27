
const express = require('express');
const { registerUser, loginUser, verifyUserOTP, resendUserOTP, logout } = require('../controllers/authController');
const { limiter } = require('../utils/otpHelper');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyUserOTP);
router.post('/resend-otp', resendUserOTP);
router.post('/logout', logout);

module.exports = router;
