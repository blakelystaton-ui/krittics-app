import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- CORE FIREBASE CONFIGURATION ---
// This object pulls the Firebase keys from the Replit Secrets (VITE_ prefixed environment variables)
// VITE ensures these variables are accessible in the client-side code.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,

  // Authentication Domain: Required for Auth services to correctly handle redirects and sign-ins.
  // It is dynamically constructed using your Project ID for reliability.
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,

  // Storage Bucket: Included for completeness, though you mentioned avoiding Firebase Cloud Storage
  // for video streaming costs (which is smart).
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,

  // Optional: Add other configurations here if needed (e.g., databaseURL, messagingSenderId)
};

// 1. Initialize the main Firebase Application
const app = initializeApp(firebaseConfig);

// 2. Initialize and Export the required services
// These exports are what your components (like Queue.jsx) will import to access the services.
export const auth = getAuth(app);
export const db = getFirestore(app);

// 3. Export the main app instance (optional, but sometimes needed)
export default app;
