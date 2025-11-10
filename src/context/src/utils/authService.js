// src/context/src/utils/authService.js (Frontend Client Code)

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

// ----------------------------------------------------------------------
// 🚨 CRITICAL FIX: The path is now corrected to reach the config folder
// from the deeply nested src/context/src/utils/ location.
// The file imported here must be the renamed client configuration file.
// ----------------------------------------------------------------------
import { auth } from "../../../../config/firebase-config";

/**
 * Creates a new user account with email and password.
 */
export const registerUser = async (email, password) => {
    try {
        // You will use this function to create your personal account
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
        );
        return userCredential.user;
    } catch (error) {
        // Log error details for debugging
        console.error("Registration Error:", error.code, error.message);
        throw error;
    }
};

/**
 * Signs in an existing user with email and password.
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password,
        );
        return userCredential.user;
    } catch (error) {
        // Log error details for debugging
        console.error("Login Error:", error.code, error.message);
        throw error;
    }
};

/**
 * Signs out the current user.
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error.message);
        throw error;
    }
};
