const admin = require('../config/firebaseConfig');
const db = admin.firestore();
const { sendOTP, verifyOTP, resendOTP } = require('../utils/otpHelper');

// User Registration
async function registerUser(req, res) {
  const { phone, firstName, lastName, email } = req.body;
  try {
    // Check if the user is already registered
    const userSnapshot = await db.collection('users').where('phone', '==', phone).get();

    if (!userSnapshot.empty) {
      return res.status(400).json({ message: 'User already registered' });
    }

    // Register new user with Firebase Authentication
    const userRecord = await admin.auth().createUser({
      phoneNumber: phone,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    // Store additional user details in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      phone,
      firstName,
      lastName,
      email,
      createdAt: admin.firestore.Timestamp.now()
    });

    // Send OTP
    const otpData = await sendOTP(phone);
    res.status(200).json({ requestId: otpData.requestId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// User Login
async function loginUser(req, res) {
  const { phone } = req.body;
  try {
    // Check if the user is registered
    const userSnapshot = await db.collection('users').where('phone', '==', phone).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send OTP
    const otpData = await sendOTP(phone);
    res.status(200).json({ requestId: otpData.requestId });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Verify OTP and Authenticate
async function verifyUserOTP(req, res) {
  const { requestId, code } = req.body;
  try {
    // Verify OTP
    const verificationResult = await verifyOTP(requestId, code);

    if (verificationResult !== 'OTP is valid') {
      return res.status(400).json({ message: verificationResult });
    }

    // Generate Firebase custom token
    const userSnapshot = await db.collection('users').where('phone', '==', phone).get();
    const user = userSnapshot.docs[0].data();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const customToken = await admin.auth().createCustomToken(user.uid);
    res.status(200).json({ token: customToken });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Resend OTP
async function resendUserOTP(req, res) {
  const { requestId } = req.body;
  try {
    // Resend OTP
    const result = await resendOTP(requestId);
    res.status(200).json({ message: result });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Logout
async function logout(req, res) {
  // Firebase handles token invalidation and session management
  res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = {
  registerUser,
  loginUser,
  verifyUserOTP,
  resendUserOTP,
  logout
};
