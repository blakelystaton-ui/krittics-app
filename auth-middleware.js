// auth-middleware.js

// Import the 'auth' object securely initialized in the other file.
// NOTE: Must have the .js extension!
import { auth } from "./firebase-admin-init.js";

async function checkAuth(req, res, next) {
    // 1. Check the request header for the Authorization token
    // It should look like: "Authorization: Bearer [token]"
    const authHeader = req.headers.authorization;

    // If no token or the token is not in the required format, reject.
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .send({
                error: "Unauthorized: No token provided or token format is incorrect.",
            });
    }

    // Isolate the raw token string
    const idToken = authHeader.split(" ")[1];

    try {
        // 2. Use the Firebase Admin SDK to verify the token's validity, signature, and expiration.
        const decodedToken = await auth.verifyIdToken(idToken);

        // 3. Token is valid! Store the user's information (like their unique ID) on the request object.
        req.user = decodedToken;

        // 4. Call next() to allow the request to proceed to the secure API endpoint logic.
        next();
    } catch (error) {
        // 5. Token is invalid (e.g., expired or tampered with). Reject the request.
        console.error("Error verifying Firebase token:", error.message);
        return res.status(401).send({ error: "Unauthorized: Invalid token." });
    }
}

export { checkAuth };
