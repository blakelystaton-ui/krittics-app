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
  authError: string | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  db: null,
  userId: null,
  isAuthReady: false,
  isFirebaseConfigured: false,
  authError: null,
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
  const [authError, setAuthError] = useState<string | null>(null);

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
      setAuthError('missing-secrets');
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
          setAuthError(null);
        } catch (error: any) {
          console.error("Firebase Auth Error:", error);
          
          // Identify specific error types
          if (error?.code === 'auth/admin-restricted-operation') {
            console.error(
              "Anonymous authentication is not enabled in your Firebase project. " +
              "Please enable it in the Firebase Console: " +
              "Authentication > Sign-in method > Anonymous > Enable"
            );
            setAuthError('anonymous-auth-disabled');
            setIsFirebaseConfigured(false);
          } else {
            // Other auth errors (network, permissions, etc.)
            console.error("Firebase authentication failed:", error.code || error.message);
            setAuthError(error?.code || 'auth-error');
            setIsFirebaseConfigured(false);
          }
          
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

    } catch (error: any) {
      console.error("Error initializing Firebase:", error);
      const fallbackId = getFallbackId();
      setUserId(fallbackId);
      setIsAuthReady(true);
      setIsFirebaseConfigured(false);
      setAuthError(error?.code || 'initialization-error');
    }
  }, []);

  return (
    <FirebaseContext.Provider value={{ app, auth, db, userId, isAuthReady, isFirebaseConfigured, authError }}>
      {children}
    </FirebaseContext.Provider>
  );
}
