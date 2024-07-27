const express = require('express');
const { bookRide, cancelRide } = require('../controllers/bookingController');
const router = express.Router();

router.post('/book', bookRide);
router.post('/cancel/:rideId', cancelRide);

module.exports = router;
