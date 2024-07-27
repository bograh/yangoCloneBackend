const admin = require('../config/firebaseConfig');
const db = admin.firestore();
// Get Driver Earnings
async function getDriverEarnings(req, res) {
  const { driverId } = req.params;
  try {
    const earningsSnapshot = await db.collection('rides')
      .where('driverId', '==', driverId)
      .where('status', '==', 'completed')
      .get();

    if (earningsSnapshot.empty) {
      return res.status(404).json({ message: 'No earnings found for this driver' });
    }

    let totalEarnings = 0;
    earningsSnapshot.forEach(doc => {
      totalEarnings += doc.data().fare;
    });

    res.status(200).json({ driverId, totalEarnings });
  } catch (error) {
    console.error('Error getting driver earnings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Receive Ride Requests
async function receiveRideRequest(req, res) {
  const { driverId } = req.params;
  try {
    const rideRequestsSnapshot = await db.collection('rides')
      .where('driverId', '==', driverId)
      .where('status', '==', 'requested')
      .get();

    if (rideRequestsSnapshot.empty) {
      return res.status(404).json({ message: 'No ride requests found' });
    }

    const rideRequests = [];
    rideRequestsSnapshot.forEach(doc => {
      rideRequests.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(rideRequests);
  } catch (error) {
    console.error('Error receiving ride requests:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Track Ride Status
async function trackRideStatus(req, res) {
  const { driverId, rideId } = req.params;
  try {
    const rideDoc = await db.collection('rides').doc(rideId).get();
    if (!rideDoc.exists || rideDoc.data().driverId !== driverId) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json({ id: rideDoc.id, ...rideDoc.data() });
  } catch (error) {
    console.error('Error tracking ride status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Accept or Decline Ride Request
async function respondToRideRequest(req, res) {
  const { driverId, rideId } = req.params;
  const { response } = req.body; // 'accept' or 'decline'
  try {
    const rideDoc = await db.collection('rides').doc(rideId).get();
    if (!rideDoc.exists || rideDoc.data().driverId !== driverId) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (response === 'accept') {
      await db.collection('rides').doc(rideId).update({ status: 'accepted' });
    } else if (response === 'decline') {
      await db.collection('rides').doc(rideId).update({ status: 'declined' });
    } else {
      return res.status(400).json({ message: 'Invalid response' });
    }

    res.status(200).json({ message: `Ride ${response}ed successfully` });
  } catch (error) {
    console.error(`Error ${response}ing ride request:`, error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  getDriverEarnings,
  receiveRideRequest,
  trackRideStatus,
  respondToRideRequest
};
