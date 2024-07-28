const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getAllUserBookings,
  createBooking,
  getBookingsByDriverId,
  getBookingsByUserId,
  getBooking,
  submitFeedback,
  getFeedbackForBooking,
  getAllFeedback

} = require("../controllers/bookingController");


//uid = user id
//did = driver id
//bid = booking id

// Create a new booking

router.post("/create/:uid/:did", async (req, res) => {
  const userId = req.params.uid;
  const driverId = req.params.did;
  const fare = req.body.fare;
  const notes = req.body.notes;
  const pickupAddress = req.body.pickupAddress;
  const dropOffAddress = req.body.dropOffAddress;

  const createBookingRequest = await createBooking(
    userId,
    driverId,
    fare,
    notes,
    pickupAddress,
    dropOffAddress
  );
  res.json(createBookingRequest);
});


router.get("/get/:bid", async (req, res) => {
  const bookingId = req.params.bid;
  const getBookingInfo = await getBooking(bookingId);
  res.json(getBookingInfo);
});

router.get("/getAll", async (req, res) => {
  const getAll = await getAllBookings();
  res.json(getAll);
});

router.get("/getAllUser/:uid", async (req, res) => {
  const userId = req.params.uid;
  const getAllUserBook = await getAllUserBookings(userId);
  res.json(getAllUserBook);
});

router.get('/getBookingsByDriverId/:driverId/bookings', async (req, res) => {
  const driverId = req.params.driverId;

  const bookings = await getBookingsByDriverId(driverId);

  res.status(200).json(bookings);
});

router.get('/getBookingsByUserId/:userId/bookings', async (req, res) => {
  const userId = req.params.userId;

  const bookings = await getBookingsByUserId(userId);

  res.status(200).json(bookings);
});

router.post("/setFeedback", async (req, res) => {
  const bookingId = req.body.bookingId;
  const rating = req.body.rating;
  const comment = req.body.comment;
  const setFeedback = await submitFeedback(bookingId, rating, comment);
  res.json(setFeedback);
});

router.get("/getFeedback/:bid", async (req, res) => {
  const bookingId = req.params.bid;
  const getFeedback = await getFeedbackForBooking(bookingId);
  res.json(getFeedback);
});

router.get("/getAllFeedback", async (req, res) => {
  const getFeedback = await getAllFeedback();
  res.json(getFeedback);
});

module.exports = router;

