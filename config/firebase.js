import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// 1. Retrieve the secure service account config from Replit Secrets
// Assumes FIREBASE_ADMIN_CONFIG is stored in your Replit Secrets
const serviceAccountConfig = JSON.parse(process.env.FIREBASE_ADMIN_CONFIG);

// 2. Initialize the Firebase Admin SDK
const app = initializeApp({
    credential: cert(serviceAccountConfig),
});

// 3. Export the Firestore Database Instance
export const db = getFirestore(app);

// ----------------------------------------------------------------------
// HELPER FUNCTIONS FOR GEMINI PIPELINE
// ----------------------------------------------------------------------

/**
 * Saves the initial movie document to the 'movies' collection.
 * @param {object} movieData - The clean JSON object from Gemini Metadata.
 * @param {string} cloudflareId - The ID of the video in Cloudflare Stream.
 * @returns {string} The new Firestore Document ID.
 */
export async function saveMovieToFirestore(movieData, cloudflareId) {
    // Combine Gemini data with manual data
    const fullMovieData = {
        ...movieData,
        cloudflareId: cloudflareId,
        posterUrl: "", // This will be updated later by generatePosterAndUpload
        status: "pending_poster",
        dateCreated: new Date().toISOString(),
    };

    // Save the new document to the 'movies' collection
    const docRef = await db.collection("movies").add(fullMovieData);

    console.log(`[Firestore] Document written with ID: ${docRef.id}`);
    return docRef.id; // Return the new Firestore ID for subsequent steps
}

/**
 * Saves the generated trivia data to the 'trivia' collection.
 * Uses the Movie's Firestore ID as the Trivia Document ID for easy lookup.
 * @param {object} triviaData - The clean JSON object from Gemini Trivia.
 * @param {string} movieId - The Firestore document ID of the parent movie.
 * @returns {string} The Document ID (same as movieId).
 */
export async function saveTriviaToFirestore(triviaData, movieId) {
    // Use .doc(movieId).set() to explicitly set the document ID
    await db.collection("trivia").doc(movieId).set(triviaData);

    console.log(`[Firestore] Trivia saved for Movie ID: ${movieId}`);
    return movieId;
}
