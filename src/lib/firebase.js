const admin = require('firebase-admin');

// Initialize Firebase Admin
// In production, use a service account JSON file:
// admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccount.json')) });
//
// For now, using environment variable (set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT)
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  admin.initializeApp(
    serviceAccount
      ? { credential: admin.credential.cert(serviceAccount) }
      : { projectId: process.env.FIREBASE_PROJECT_ID }
  );
}

module.exports = { firebaseAdmin: admin };
