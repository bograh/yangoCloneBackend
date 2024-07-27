const functions = require('firebase-functions');
const admin = require('firebase-admin');
const geofire = require('geofire-common');
const db = admin.firestore();


// Placeholder implementation for getUserLocation
async function getUserLocation(userId) {
  try {
    const userSnapshot = await db.collection("users").doc(userId).get();
    if (!userSnapshot.exists) {
      return null;
    }
    const userData = userSnapshot.data();
    return userData.location; // Adjust based on your actual data structure
  } catch (error) {
    console.error("Error fetching user location:", error);
    return null;
  }
}


// Create Booking
async function createBooking(userId, driverId, userLocation) {
  const userBookingStatus = await getUserBookingField(userId);

  if (
    userBookingStatus.status !== "pending" &&
    userBookingStatus.status !== "accepted"
  ) {
    try {
      if (!userLocation) {
        return { error: "User location not provided" };
      }

      // Create a booking request
      const bookingRequest = createBookingRequest(
        userId,
        driverId,
        userLocation
      );

      // Save the booking request to the database
      const bookingRef = await db.collection("bookings").add(bookingRequest);

      return { message: "Booking confirmed", bookingId: bookingRef.id };
    } catch (err) {
      return { error: err.message };
    }
  } else {
    return { error: "You have a pending or accepted booking" };
  }
}


// Get a particular booking by its ID
async function getBooking(bookingId) {
  try {
    if (!bookingId) {
      return { error: 'Invalid bookingId' };
    }

    // Get the booking from the database
    const bookingSnapshot = await db.collection('bookings').doc(bookingId).get();

    if (!bookingSnapshot.exists) {
      return { error: 'Booking not found' };
    }

    const booking = { id: bookingSnapshot.id, ...bookingSnapshot.data() };

    return booking;
  } catch (err) {
    return { error: err.message };
  }
}

// Get all bookings in the database to be used by the admin
async function getAllBookings() {
  try {
    const bookingsSnapshot = await db.collection('bookings').get();
    const bookings = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return bookings;
  } catch (err) {
    return { error: err.message };
  }
}

// Get all bookings for a specific user
async function getAllUserBookings(userId) {
  try {
    if (!userId) {
      return { error: 'Invalid userId' };
    }
    const bookingsSnapshot = await db
      .collection('bookings')
      .where('userId', '==', userId)
      .get();

    const bookings = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return bookings;
  } catch (err) {
    return { error: err.message };
  }
}

// Submit Feedback
async function submitFeedback(bookingId, rating, comment) {
  try {
    // Check if the provided bookingId is valid
    const bookingSnapshot = await db.collection('bookings').doc(bookingId).get();
    if (!bookingSnapshot.exists) {
      return { error: 'Booking not found' };
    }

    // Validate the rating within the range 1-5
    if (rating < 1 || rating > 5) {
      return { error: 'Invalid rating. Rating must be between 1 and 5.' };
    }

    // Save feedback to the database
    const feedbackData = {
      bookingId,
      rating,
      comment,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('feedback').add(feedbackData);

    // Calculate the average rating for the service provider
    const feedbackQuery = await db.collection('feedback')
      .where('bookingId', '==', bookingId)
      .get();
    const totalFeedbacks = feedbackQuery.size;
    const totalRating = feedbackQuery.docs.reduce(
      (sum, doc) => sum + doc.data().rating,
      0
    );
    const averageRating = totalRating / totalFeedbacks;

    // Update the service provider's average rating in the 'vehicleDetails' collection
    await db.collection('vehicleDetails').doc(bookingSnapshot.data().driverId).update({
      averageRating: averageRating.toFixed(2),
    });

    return { message: 'Feedback submitted successfully' };
  } catch (err) {
    return { error: err.message };
  }
}

// Get Feedback for a Booking
async function getFeedbackForBooking(bookingId) {
  try {
    // Check if the provided bookingId is valid
    const bookingSnapshot = await db.collection('bookings').doc(bookingId).get();
    if (!bookingSnapshot.exists) {
      return { error: 'Booking not found' };
    }

    // Retrieve feedback for the specified booking
    const feedbackQuery = await db.collection('feedback')
      .where('bookingId', '==', bookingId)
      .get();

    const feedbackList = feedbackQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { feedback: feedbackList };
  } catch (err) {
    return { error: err.message };
  }
}

// Get All Feedback
async function getAllFeedback() {
  try {
    // Retrieve feedback
    const feedbackQuery = await db.collection('feedback').get();

    const feedbackList = feedbackQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { feedback: feedbackList };
  } catch (err) {
    return { error: err.message };
  }
}

// Get Pickup by Status
async function getPickupByStatus(status) {
  try {
    const pickupSnapshot = await db.collection('bookings').where('status', '==', status).get();

    const pickupData = pickupSnapshot.docs.map((doc) => doc.data());

    if (pickupData.length > 0) {
      return pickupData;
    } else {
      return { error: 'No pickup specified by the status specified' };
    }
  } catch (error) {
    console.error('Error getting pickup status:', error);
    return { error: 'Failed to get pickup status' };
  }
}

// Get User Booking Field
async function getUserBookingField(userId) {
  try {
    const bookingSnapshot = await db.collection('bookings').where('userId', '==', userId).get();
    if (bookingSnapshot.empty) {
      return { error: 'No booking found' };
    }
    const booking = bookingSnapshot.docs[0].data();
    return booking;
  } catch (error) {
    console.error('Error fetching user booking:', error);
    return { error: 'Failed to fetch user booking' };
  }
}

// Find Available Taxis
async function findAvailableTaxis() {
  try {
    const vehiclesSnapshot = await db.collection('vehicleDetails').where('availability', '==', true).get();
    return vehiclesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error finding available taxis:', error);
    return { error: 'Failed to find available taxis' };
  }
}

// Select Nearest Taxi
function selectNearestTaxi(taxis, userLocation) {
  const distances = taxis.map((taxi) => ({
    id: taxi.id,
    distance: geofire.distanceBetween(
      [userLocation.lat, userLocation.lng],
      [taxi.location.lat, taxi.location.lng]
    ),
  }));
  distances.sort((a, b) => a.distance - b.distance);
  return taxis.find((taxi) => taxi.id === distances[0].id);
}

// Create Booking Request
function createBookingRequest(userId, driverId, userLocation) {
  return {
    pickupLocation: userLocation,
    status: 'pending',
    driverId,
    userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

module.exports = {
  createBooking,
  getBooking,
  getAllBookings,
  getAllUserBookings,
  submitFeedback,
  getFeedbackForBooking,
  getAllFeedback,
  getPickupByStatus,
  findAvailableTaxis,
  selectNearestTaxi,
  getUserBookingField,
};
