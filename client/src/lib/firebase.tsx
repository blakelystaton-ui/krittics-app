import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  type Auth,
  signInAnonymously, 
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  type Firestore
} from 'firebase/firestore';

interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  userId: string | null;
  isAuthReady: boolean;
  isFirebaseConfigured: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  db: null,
  userId: null,
  isAuthReady: false,
  isFirebaseConfigured: false,
});

export const useFirebase = () => useContext(FirebaseContext);

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps): JSX.Element {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const appId = import.meta.env.VITE_FIREBASE_APP_ID;

    // Helper to get or create stable fallback ID
    const getFallbackId = () => {
      const existing = localStorage.getItem('krittics-user-id');
      if (existing) return existing;
      const newId = crypto.randomUUID();
      localStorage.setItem('krittics-user-id', newId);
      return newId;
    };

    if (!apiKey || !projectId || !appId) {
      console.warn('Firebase not configured. Multiplayer features will be unavailable. Configure Firebase secrets to enable.');
      const fallbackId = getFallbackId();
      setUserId(fallbackId);
      setIsAuthReady(true);
      setIsFirebaseConfigured(false);
      return;
    }

    try {
      const firebaseConfig = {
        apiKey,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: `${projectId}.firebasestorage.app`,
        appId,
      };

      // Check if Firebase app already exists (handles React StrictMode double-invocation)
      let firebaseApp: FirebaseApp;
      if (getApps().length === 0) {
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        firebaseApp = getApp();
      }

      const firebaseAuth = getAuth(firebaseApp);
      const firestore = getFirestore(firebaseApp);
      
      setApp(firebaseApp);
      setAuth(firebaseAuth);
      setDb(firestore);
      setIsFirebaseConfigured(true);

      const authenticate = async () => {
        try {
          await signInAnonymously(firebaseAuth);
        } catch (error) {
          console.error("Firebase Auth Error:", error);
          // Set configuration to false since auth failed
          setIsFirebaseConfigured(false);
          const fallbackId = getFallbackId();
          setUserId(fallbackId);
          setIsAuthReady(true);
        }
      };

      authenticate();

      const unsubscribe = onAuthStateChanged(firebaseAuth, (user: User | null) => {
        // Use stable fallback ID if no user (don't regenerate on every event)
        const currentId = user?.uid || getFallbackId();
        setUserId(currentId);
        setIsAuthReady(true);
        console.log("Firebase auth state changed. User ID:", currentId);
      });

      return () => unsubscribe();

    } catch (error) {
      console.error("Error initializing Firebase:", error);
      const fallbackId = getFallbackId();
      setUserId(fallbackId);
      setIsAuthReady(true);
      setIsFirebaseConfigured(false);
    }
  }, []);

  return (
    <FirebaseContext.Provider value={{ app, auth, db, userId, isAuthReady, isFirebaseConfigured }}>
      {children}
    </FirebaseContext.Provider>
  );
}
