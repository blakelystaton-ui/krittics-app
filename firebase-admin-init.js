// firebase-admin-init.js

import * as admin from 'firebase-admin';

// Load environment variables from .env file if running locally or if needed
// You might not need this line if Replit is configured correctly, but it's safe practice
// import 'dotenv/config'; 

// 1. Retrieve the entire JSON string from the secure Replit Secrets
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountString) {
    // If this error is thrown, check Step 2 immediately!
    throw new Error("ERROR: FIREBASE_SERVICE_ACCOUNT_JSON secret is not set! Check Replit Secrets.");
}

// 2. Convert the text string back into a JavaScript object
const serviceAccount = JSON.parse(serviceAccountString);

// 3. Initialize the Admin SDK, giving it your secure credentials
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // You can add 'databaseURL' here if needed, but not required for just Auth/Firestore
});

// 4. Create easy-to-use exports for the core services you need
const auth = admin.auth();
const db = admin.firestore(); // This is for your backend database

console.log("Firebase Admin SDK successfully initialized and ready!");

export { auth, db, admin };