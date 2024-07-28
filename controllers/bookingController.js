const admin = require('firebase-admin');
const db = admin.firestore();




async function createBooking(userId, driverId, fare, notes, pickupAddress, dropOffAddress) {
  const userRef = db.collection('users').doc(userId);
  const doc = await userRef.get();
  if (!doc.exists) {
    return { error: "User not found" };
  }

  const userBookingStatus = doc.data().bookingStatus;

  if (!userBookingStatus || (userBookingStatus.status !== "pending" && userBookingStatus.status !== "accepted")) {
    try {
      const bookingRequest = {
        userId: userId,
        driverId: driverId,
        fare: fare,
        pickupAddress: pickupAddress,
        dropOffAddress: dropOffAddress,
        notes: notes,
        status: 'pending'
      };
      
      async function saveBookingRequest(bookingRequest) {
        const bookingRef = await db.collection('bookings').add(bookingRequest);
        return bookingRef;
      }
      // Save the booking request to the database
      const bookingRef = await saveBookingRequest(bookingRequest);

      return { message: "Booking confirmed", bookingId: bookingRef.id };
    } catch (err) {
      return { error: err.message };
    }
  } else {
    return { error: "You have a pending or accepted booking" };
  }
}
//Get a particular booking by its ID
async function getBooking(bookingId) {
  try {
    if (!bookingId) {
      return "Invalid bookingId";
    }

    // Get the booking from the database
    const bookingSnapshot = await db
      .collection("bookings")
      .doc(bookingId)
      .get();

    if (!bookingSnapshot.exists) {
      return "Booking not found";
    }

    const booking = { id: bookingSnapshot.id, ...bookingSnapshot.data() };

    return booking;
  } catch (err) {
    return err.message;
  }
}

// Get all bookings in the database to be used by the admin
async function getAllBookings() {
  try {
    const bookingsSnapshot = await db.collection("bookings").get();
    const bookings = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return bookings;
  } catch (err) {
    return err.message;
  }
}

// Get all bookings for a specific user
async function getAllUserBookings(userId) {
  try {
    if (!userId) {
      return "Invalid userId";
    }
    const bookingsSnapshot = await db
      .collection("bookings")
      .where("userId", "=", userId)
      .get();
    console.log(bookingsSnapshot);
    const bookings = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return bookings;
  } catch (err) {
    return err.message;
  }
}

async function getBookingsByDriverId(driverId) {
  try {
    const bookingsSnapshot = await db.collection('bookings')
      .where('driverId', '==', driverId)
      .get();

    if (bookingsSnapshot.empty) {
      return { message: 'No bookings found for this driver' };
    }

    const bookings = bookingsSnapshot.docs.map(doc => doc.data());
    return bookings;
  } catch (error) {
    console.error('Error getting bookings:', error);
    return { message: 'Error getting bookings' };
  }
}


async function getBookingsByUserId(userId) {
  try {
    const bookingsSnapshot = await db.collection('bookings')
      .where('userId', '==', userId)
      .get();

    if (bookingsSnapshot.empty) {
      return { message: 'No bookings found for this user' };
    }

    const bookings = bookingsSnapshot.docs.map(doc => doc.data());
    return bookings;
  } catch (error) {
    console.error('Error getting bookings:', error);
    return { message: 'Error getting bookings' };
  }
}

const feedbackCollection = db.collection("feedback");
// Feedback Submission
async function submitFeedback(bookingId, rating, comment) {
  try {
    // Check if the provided bookingId is valid
    const bookingSnapshot = await db
      .collection("bookings")
      .doc(bookingId)
      .get();
    if (!bookingSnapshot.exists) {
      return "Booking not found";
    }

    // Validate the rating within the range 1-5
    if (rating < 1 || rating > 5) {
      return "Invalid rating. Rating must be between 1 and 5.";
    }

    // Save feedback to the database
    const feedbackData = {
      bookingId,
      rating,
      comment,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await feedbackCollection.add(feedbackData);

    // Calculate the average rating for the service provider
    const feedbackQuery = await feedbackCollection
      .where("bookingId", "==", bookingId)
      .get();
    const totalFeedbacks = feedbackQuery.size;
    console.log("Total feedbacks are " + totalFeedbacks);
    const totalRating = feedbackQuery.docs.reduce(
      (sum, doc) => sum + doc.data().rating,
      0
    );
    console.log("Total rating is " + totalRating);
    const averageRating = totalRating / totalFeedbacks;
    console.log("Average rating is " + averageRating);

    // Update the service provider's average rating in the 'trucks' collection
    await db
      .collection("vehicleDetails")
      .doc(bookingSnapshot.data().driverId)
      .update({
        averageRating: averageRating.toFixed(2),
      });

    return { message: "Feedback submitted successfully" };
  } catch (err) {
    return err.message;
  }
}

async function getFeedbackForBooking(bookingId) {
  try {
    // Check if the provided bookingId is valid
    const bookingSnapshot = await db
      .collection("bookings")
      .doc(bookingId)
      .get();
    if (!bookingSnapshot.exists) {
      return "Booking not found";
    }

    // Retrieve feedback for the specified booking
    const feedbackQuery = await feedbackCollection
      .where("bookingId", "==", bookingId)
      .get();

    const feedbackList = feedbackQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { feedback: feedbackList };
  } catch (err) {
    return err.message;
  }
}

async function getAllFeedback() {
  try {
    // Retrieve feedback for the specified booking
    const feedbackQuery = await feedbackCollection.get();

    const feedbackList = feedbackQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { feedback: feedbackList };
  } catch (err) {
    return err.message;
  }
}

module.exports = {
  createBooking,
  getBooking,
  getAllBookings,
  getAllUserBookings,
  getBookingsByDriverId,
  getBookingsByUserId,
  submitFeedback,
  getFeedbackForBooking,
  getAllFeedback,
  
};

