import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 1. Firebase configuration using environment variables
const firebaseConfig = {
  // IMPORTANT: Keys must be prefixed with VITE_ and stored in Replit Secrets
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // CRITICAL FIX: The missing App ID
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Add other config items here if necessary (storageBucket, messagingSenderId, etc.)
};

// 2. Conditional Initialization to prevent conflicts during development
// If a Firebase app instance already exists, retrieve it; otherwise, initialize a new one.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 3. Export initialized services
export const db = getFirestore(app); // For saving/fetching data (Krossfire Rooms)
export const auth = getAuth(app); // For user authentication (Sign In/Crew)

export default app;
