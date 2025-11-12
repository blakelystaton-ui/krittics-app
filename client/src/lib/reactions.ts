import { useFirebase } from "./firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { useCallback } from "react";

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

  const saveReaction = useCallback(async (movieId: string, type: ReactionType): Promise<boolean> => {
    if (!isFirebaseConfigured || !db || !userId) {
      console.warn("Firebase not configured. Reaction not saved.");
      return false;
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
      return true;
    } catch (error) {
      console.error("Error saving reaction:", error);
      throw error;
    }
  }, [db, userId, isFirebaseConfigured]);

  const removeReaction = useCallback(async (movieId: string): Promise<boolean> => {
    if (!isFirebaseConfigured || !db || !userId) {
      console.warn("Firebase not configured. Reaction not removed.");
      return false;
    }

    try {
      const reactionDoc = doc(db, "reactions", `${userId}_${movieId}`);
      await deleteDoc(reactionDoc);
      return true;
    } catch (error) {
      console.error("Error removing reaction:", error);
      throw error;
    }
  }, [db, userId, isFirebaseConfigured]);

  const getReaction = useCallback(async (movieId: string): Promise<ReactionType | null> => {
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
  }, [db, userId, isFirebaseConfigured]);

  return {
    saveReaction,
    removeReaction,
    getReaction,
    isFirebaseConfigured,
  };
}
