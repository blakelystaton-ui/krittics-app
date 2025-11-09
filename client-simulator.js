// client-simulator.js
import fetch from "node-fetch";
import { initializeApp } from "firebase/app";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC4p6LMjThAKzlGmIRhLGsNSh-SWsLAJNA",
    authDomain: "krittics-5bcc9.firebaseapp.com",
    projectId: "krittics-5bcc9",
    storageBucket: "krittics-5bcc9.firebasestorage.app",
    messagingSenderId: "129702120983",
    appId: "1:129702120983:web:99903e0b6ccd0596439652",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- 1. SIMULATE A FAILED (UNAUTHENTICATED) CALL ---
async function testFailedCall(serverUrl) {
    console.log("--- 1. Testing Unauthenticated Call (Expected to Fail) ---");
    try {
        const response = await fetch(`${serverUrl}/api/user/profile`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();

        if (response.status === 401) {
            console.log(
                "✅ Success: Unauthenticated call was correctly rejected by the server.",
            );
        } else {
            console.error(
                `❌ Failed: Server returned status ${response.status} instead of 401.`,
            );
        }
    } catch (error) {
        console.error(
            "❌ Failed: Error during unauthenticated test.",
            error.message,
        );
    }
}

// --- 2. SIMULATE SUCCESSFUL LOGIN AND AUTHENTICATED CALL ---
async function testSuccessfulCall(serverUrl) {
    console.log(
        "\n--- 2. Testing Authenticated Call (Expected to Succeed) ---",
    );

    // CRUCIAL: You MUST create this user in your Firebase Console (Authentication tab) first!
    const TEST_EMAIL = "testuser@krittics.com";
    const TEST_PASSWORD = "password123";

    try {
        // A. Log in the test user to get a Firebase user object
        const userCredential = await signInWithEmailAndPassword(
            auth,
            TEST_EMAIL,
            TEST_PASSWORD,
        );

        // B. Get the security token (ID Token)
        const idToken = await userCredential.user.getIdToken();
        console.log(`✅ Token retrieved for user ${TEST_EMAIL}`);

        // C. Make the secure API call using the Bearer token
        const response = await fetch(`${serverUrl}/api/user/profile`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // This is how we send the token to your checkAuth middleware!
                Authorization: `Bearer ${idToken}`,
            },
        });

        const data = await response.json();

        if (response.status === 200) {
            console.log(
                `✅ SUCCESS: Secure API Call Verified! Server response: ${data.message}`,
            );
        } else {
            console.error(
                `❌ Failed: Authenticated call failed with status ${response.status}.`,
                data,
            );
        }
    } catch (error) {
        console.error(
            "❌ Failed: Error during authenticated test. Did you create the test user in Firebase?",
            error.message,
        );
    }
}

// --- MAIN EXECUTION ---
async function runTests() {
    // Replit uses the webview URL for the server endpoint
    const serverUrl =
        "https://4b33485b-f105-42c2-a679-327d92b08c05-00-1lyj8n2fvknkz.picard.replit.dev";

    await testFailedCall(serverUrl);
    await testSuccessfulCall(serverUrl);
}

runTests();
