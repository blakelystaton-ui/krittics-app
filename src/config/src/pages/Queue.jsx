import React, { useState, useEffect } from "react";
// Import necessary Firebase tools
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";

const Queue = () => {
  const [loading, setLoading] = useState(true);
  const [userQueue, setUserQueue] = useState(null); // Will hold the array of movie IDs
  const [currentUser, setCurrentUser] = useState(null); // The authenticated user object

  // 1. Listen for Authentication Changes
  useEffect(() => {
    // onAuthStateChanged is the most reliable way to get the current user
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribeAuth; // Cleanup function for listener
  }, []);

  // 2. Fetch User's Queue Data (only runs when currentUser changes)
  useEffect(() => {
    let unsubscribeQueue = () => {};

    if (currentUser) {
      // The document path is: 'users' collection -> document ID is the user's UID
      const userDocRef = doc(db, "users", currentUser.uid);

      // Use onSnapshot for a real-time listener (updates if the user saves a new movie)
      unsubscribeQueue = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            // Check if the 'queue' field exists, otherwise default to an empty array
            setUserQueue(docSnap.data().queue || []);
          } else {
            // Document does not exist yet (first-time user), so the queue is empty
            setUserQueue([]);
          }
        },
        (error) => {
          console.error("Error listening to user queue:", error);
          // Handle error gracefully
        },
      );
    } else {
      setUserQueue(null); // Clear queue if user logs out
    }

    return unsubscribeQueue; // Cleanup function for the Firestore listener
  }, [currentUser]); // Dependency on the user object

  // --- RENDERING LOGIC ---
  if (loading) {
    return <div className="loading-state">Authenticating User...</div>;
  }

  if (!currentUser) {
    return (
      <div className="auth-message">
        Please **sign in** to view your saved movies.
      </div>
    );
  }

  if (userQueue === null) {
    return <div className="loading-state">Loading your queue...</div>;
  }

  return (
    <div className="queue-page">
      <h2>🎬 My Krittics Queue</h2>
      <p>This is your personalized list of saved movies.</p>

      {userQueue.length === 0 ? (
        <div className="empty-state">
          You haven't added any movies to your queue yet. Start browsing!
        </div>
      ) : (
        <div className="movie-grid">
          {userQueue.map((movieID) => (
            // IMPORTANT: This only displays the ID. You would need
            // another function/component to fetch the movie's title/poster
            // using this movieID from your main movie data source (e.g., TMDb or your own Firestore/database).
            <div key={movieID} className="queue-movie-item">
              <p>Movie ID: **{movieID}**</p>
              {/* <MovieCard movieId={movieID} />  <- The ideal implementation */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Queue;
