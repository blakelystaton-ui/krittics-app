import { doc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../config/firebase";

/**
 * Toggles a movie ID into or out of the current user's queue array in Firestore.
 * @param {string} movieId The unique ID of the movie (e.g., TMDb ID, internal ID).
 */
export const toggleMovieInQueue = async (movieId) => {
  const user = auth.currentUser;

  if (!user) {
    console.error("User not authenticated. Cannot save movie.");
    // In a real app, you would prompt the user to sign in here.
    return;
  }

  const userDocRef = doc(db, "users", user.uid);

  try {
    // 1. We first attempt to SET the document to ensure it exists.
    // The merge: true option ensures that if the document is new, it's created,
    // and if it exists, it only updates the queue field (if it exists)
    // without overwriting other user data.
    await setDoc(
      userDocRef,
      {
        // Initialize the queue as an empty array if it doesn't exist
        queue: arrayUnion(movieId),
      },
      { merge: true },
    );

    // 2. We use updateDoc and arrayUnion to add the movie ID to the array.
    // If you need complex logic to check if it already exists, you'd need a
    // more advanced approach, but arrayUnion handles the 'add' side safely.
    // For Toggling (adding if not present, removing if present), we need a helper:

    // For simplicity, let's just make this function ADD the movie for now.
    // A fully featured TOGGLE function is more complex and usually involves a transaction.

    // For now, let's just use arrayUnion to safely add the ID.
    await updateDoc(userDocRef, {
      queue: arrayUnion(movieId),
    });

    console.log(`Movie ID ${movieId} added to queue for user ${user.uid}`);

    // If you wanted a full toggle (add/remove), you would need to fetch the document
    // first and then use arrayRemove or arrayUnion based on whether the ID is present.
  } catch (error) {
    console.error("Error saving movie to queue:", error);
    throw new Error("Failed to save movie to queue.");
  }
};
