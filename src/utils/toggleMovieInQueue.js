import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../config/firebase";

/**
 * Adds a movie ID to the current user's queue array in Firestore if it's not already present.
 * NOTE: For simplicity, this version only ADDS. To REMOVE, you would need to use arrayRemove.
 * @param {string} movieId - The unique ID of the movie (e.g., TMDb ID, internal ID).
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
export const addMovieToQueue = async (movieId) => {
  const user = auth.currentUser;

  if (!user) {
    // Return or throw an error if no user is logged in (should be caught by your UI)
    console.error("Authentication required to save movies.");
    return false;
  }

  // Path: /users/{user.uid}
  const userDocRef = doc(db, 'users', user.uid);

  try {
    // arrayUnion ensures the movieId is added only once, even if called multiple times.
    // The create/update is handled by the security rules (Step 1.2).
    await updateDoc(userDocRef, {
        queue: arrayUnion(movieId)
    });

    console.log(`Movie ID ${movieId} successfully added to queue for user ${user.uid}`);
    return true;

  } catch (error) {
    // This usually happens if the user document doesn't exist yet.
    // We can try to create it here with an initial queue array.
    if (error.code === 'not-found') {
         // If the document doesn't exist, use setDoc to create it with the initial queue
         // This is a common pattern when a user's doc is only created after their first action.
         await setDoc(userDocRef, {
            queue: [movieId],
            createdAt: new Date()
         });
         console.log(`User document created and Movie ID ${movieId} added.`);
         return true;
    }

    console.error("Failed to add movie to queue:", error);
    return false;
  }
};
```

#### **Step 2.2: Integrate the Save Button (Example Component)**

Imagine you have a `MoviePage.jsx` where you show details for a movie with the ID `tt123456`. You would use the utility like this:

```jsx
// Example Movie Display Component (NOT a file to save, just for reference)

import React from 'react';
import { addMovieToQueue } from '../utils/toggleMovieInQueue'; 

const MoviePage = ({ movieId, movieTitle }) => {

    const handleSave = async () => {
        const success = await addMovieToQueue(movieId);
        if (success) {
            // Display a success toast notification to the user
            alert(`${movieTitle} added to your Queue!`);
        } else {
            // Display an error or redirect user to sign-in
            alert("Please sign in to save movies.");
        }
    };

    return (
        <div>
            <h1>{movieTitle}</h1>
            <button 
                onClick={handleSave} 
                className="p-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
            >
                <span role="img" aria-label="save">➕</span> Save to Queue
            </button>
            {/* ... rest of the movie content */}
        </div>
    );
};