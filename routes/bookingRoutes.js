const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create a new booking
router.post('/book/:userId/:driverId', async (req, res) => {
    const { userLocation } = req.body;
    const { userId, driverId } = req.params;
  
    if (!userLocation) {
      return res.status(400).json({ error: "Missing userLocation in request body" });
    }
  
    const result = await bookingController.createBooking(userId, driverId, userLocation);
  
    if (result.error) {
      return res.status(400).json(result);
    }
  
    res.json(result);
  });
// Get a particular booking by its ID
router.get('/booking/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  const result = await bookingController.getBooking(bookingId);
  if (result.error) {
    return res.status(404).json({ error: result });
  }
  return res.status(200).json(result);
});

// Get all bookings
router.get('/bookings', async (req, res) => {
  const result = await bookingController.getAllBookings();
  if (result.error) {
    return res.status(500).json({ error: result });
  }
  return res.status(200).json(result);
});

// Get all bookings for a specific user
router.get('/user/:userId/bookings', async (req, res) => {
  const { userId } = req.params;
  const result = await bookingController.getAllUserBookings(userId);
  if (result.error) {
    return res.status(404).json({ error: result });
  }
  return res.status(200).json(result);
});

// Submit feedback
router.post('/feedback/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  const { rating, comment } = req.body;
  const result = await bookingController.submitFeedback(bookingId, rating, comment);
  if (result.error) {
    return res.status(400).json({ error: result });
  }
  return res.status(201).json(result);
});

// Get feedback for a booking
router.get('/booking/:bookingId/feedback', async (req, res) => {
  const { bookingId } = req.params;
  const result = await bookingController.getFeedbackForBooking(bookingId);
  if (result.error) {
    return res.status(404).json({ error: result });
  }
  return res.status(200).json(result);
});

// Get all feedback
router.get('/feedback', async (req, res) => {
  const result = await bookingController.getAllFeedback();
  if (result.error) {
    return res.status(500).json({ error: result });
  }
  return res.status(200).json(result);
});

// Get pickups by status
router.get('/pickups/status/:status', async (req, res) => {
  const { status } = req.params;
  const result = await bookingController.getPickupByStatus(status);
  if (result.error) {
    return res.status(500).json({ error: result });
  }
  return res.status(200).json(result);
});

// Find available taxis
router.get('/taxis/available', async (req, res) => {
  const result = await bookingController.findAvailableTaxis();
  if (result.error) {
    return res.status(500).json({ error: result });
  }
  return res.status(200).json(result);
});

// Get user booking field
router.get('/user/:userId/booking', async (req, res) => {
  const { userId } = req.params;
  const result = await bookingController.getUserBookingField(userId);
  if (result.error) {
    return res.status(404).json({ error: result });
  }
  return res.status(200).json(result);
});

module.exports = router;
