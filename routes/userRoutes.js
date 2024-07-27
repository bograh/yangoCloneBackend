const express = require('express');
const { updateUserProfile } = require('../controllers/userController');
const router = express.Router();

router.put('/profile', updateUserProfile);

module.exports = router;
