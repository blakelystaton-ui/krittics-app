import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Assuming you'll use Firestore

// 1. Configuration object uses the Replit/Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,

  // IMPORTANT: For Authentication to work, you often need the authDomain.
  // It is usually built from your Project ID.
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,

  // You may need these later for your video/storage components:
  // storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  // messagingSenderId: "YOUR_SENDER_ID_IF_NEEDED",
};

// 2. Initialize the Firebase app
const app = initializeApp(firebaseConfig);

// 3. Initialize and export the services you need
export const auth = getAuth(app);
export const db = getFirestore(app); // Database access

export default app;
