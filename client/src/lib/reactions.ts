import { useFirebase } from "./firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

export type ReactionType = "like" | "dislike";

export interface UserReaction {
  userId: string;
  movieId: string;
  type: ReactionType;
  timestamp: number;
}

/**
 * Hook for managing movie reactions (likes/dislikes) in Firebase
 */
export function useReactions() {
  const { db, userId, isFirebaseConfigured } = useFirebase();

  const saveReaction = async (movieId: string, type: ReactionType): Promise<void> => {
    if (!isFirebaseConfigured || !db || !userId) {
      console.warn("Firebase not configured. Reaction not saved.");
      return;
    }

    try {
      const reactionDoc = doc(db, "reactions", `${userId}_${movieId}`);
      const reaction: UserReaction = {
        userId,
        movieId,
        type,
        timestamp: Date.now(),
      };

      await setDoc(reactionDoc, reaction);
    } catch (error) {
      console.error("Error saving reaction:", error);
      throw error;
    }
  };

  const removeReaction = async (movieId: string): Promise<void> => {
    if (!isFirebaseConfigured || !db || !userId) {
      console.warn("Firebase not configured. Reaction not removed.");
      return;
    }

    try {
      const reactionDoc = doc(db, "reactions", `${userId}_${movieId}`);
      await deleteDoc(reactionDoc);
    } catch (error) {
      console.error("Error removing reaction:", error);
      throw error;
    }
  };

  const getReaction = async (movieId: string): Promise<ReactionType | null> => {
    if (!isFirebaseConfigured || !db || !userId) {
      return null;
    }

    try {
      const reactionDoc = doc(db, "reactions", `${userId}_${movieId}`);
      const snapshot = await getDoc(reactionDoc);
      
      if (snapshot.exists()) {
        const data = snapshot.data() as UserReaction;
        return data.type;
      }
      return null;
    } catch (error) {
      console.error("Error getting reaction:", error);
      return null;
    }
  };

  return {
    saveReaction,
    removeReaction,
    getReaction,
    isFirebaseConfigured,
  };
}
