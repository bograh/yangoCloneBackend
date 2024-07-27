const express = require('express');
const {
  getDriverEarnings,
  receiveRideRequest,
  trackRideStatus,
  respondToRideRequest
} = require('../controllers/driverController');
const router = express.Router();

router.get('/earnings/:driverId', getDriverEarnings);
router.get('/requests/:driverId', receiveRideRequest);
router.get('/status/:driverId/:rideId', trackRideStatus);
router.post('/respond/:driverId/:rideId', respondToRideRequest);

module.exports = router;
