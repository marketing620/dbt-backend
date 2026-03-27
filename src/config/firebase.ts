import * as admin from 'firebase-admin';

try {
  // Option 1: Vercel String Variables (For Production)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Vercel sometimes mangles the \n newline characters in the private key, so we replace them back
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } 
  // Option 2: Local JSON File (For Local Development)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(`../../${process.env.FIREBASE_SERVICE_ACCOUNT_PATH}`);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } 
  else {
    // Attempt default initialization
    admin.initializeApp();
  }
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

export const db = admin.firestore();
