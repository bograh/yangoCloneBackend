const admin = require('../config/firebaseConfig');
const db = admin.firestore();

const updateUserProfile = async (req, res) => {
  const { uid, profileData } = req.body;

  try {
    await db.collection('users')
    .doc(uid)
    .set(profileData, 
        { merge: true });
    res.status(200).send('Profile updated');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = { updateUserProfile };
