const admin = require('../config/firebaseConfig');
const db = admin.firestore();

const bookRide = async (req, res) => {
  const { userId, pickupLocation, dropoffLocation, vehicleType, fare } = req.body;

  try {
    const ride = await db.collection('rides').add({
      userId,
      pickupLocation,
      dropoffLocation,
      vehicleType,
      fare,
      status: 'requested',
      createdAt: new Date()
    });

    res.status(200).send({ rideId: ride.id });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const cancelRide = async (req, res) => {
  const { rideId } = req.params;

  try {
    await db.collection('rides').doc(rideId).update({ status: 'cancelled' });
    res.status(200).send('Ride cancelled');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = { bookRide, cancelRide };
