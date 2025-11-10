// firebase-client.js (FRONTEND CLIENT ONLY)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 1. Define the config using the VITE_ prefixed environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_PROJECT_ID + ".firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Add other necessary client keys here if you use Storage, etc.
};

// 2. Initialize the Firebase Client SDK
const app = initializeApp(firebaseConfig);

// 3. Export services for the frontend to use
export const auth = getAuth(app);
export const dbClient = getFirestore(app);
