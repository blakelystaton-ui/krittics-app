// src/utils/authService.js
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
// Make sure this path is correct for your project!
import { auth } from "../firebase-config";

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
        console.error("Registration Error:", error.message);
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
        console.error("Login Error:", error.message);
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
