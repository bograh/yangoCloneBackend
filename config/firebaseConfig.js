const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

// Check if the Firebase Admin SDK has already been initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;