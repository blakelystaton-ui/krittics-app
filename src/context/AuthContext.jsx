// src/context/AuthContext.jsx (Example structure)

import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config"; // Import the initialized auth instance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This Firebase function runs every time the user's login status changes (sign in/out)
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            // Once the user is known, the application is ready to render protected pages
        });

        // Cleanup function for when the component unmounts
        return unsubscribe;
    }, []);

    if (loading) {
        // Prevent the flash-and-redirect by showing a loader until the auth state is known
        return <div>Checking User Status...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
