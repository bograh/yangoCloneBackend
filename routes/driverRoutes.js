const express = require('express');
const router = express.Router();
const {
  getDriverEarnings,
  receiveRideRequest,
  trackRideStatus,
  respondToRideRequest
} = require('../controllers/driverController');

router.get('/earnings/:driverId', getDriverEarnings);
router.get('/ride-requests/:driverId', receiveRideRequest);
router.get('/ride-status/:driverId/:rideId', trackRideStatus);
router.post('/ride-requests/:driverId/:rideId/respond', respondToRideRequest);

module.exports = router;
