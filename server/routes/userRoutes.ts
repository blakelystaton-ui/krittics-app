/**
 * userRoutes.ts
 * 
 * API routes for user management, friends, and crew matching
 */

import type { Express } from "express";
import { UserService } from "../services/UserService";
import type { IStorage } from "../models/IStorage";
import { isAuthenticated } from "../middleware/auth";

export function registerUserRoutes(app: Express, storage: IStorage) {
  const userService = new UserService(storage);

  /**
   * GET /api/auth/user
   * Get current authenticated user
   */
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await userService.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("[User API] Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  /**
   * PUT /api/user/interests
   * Update user's interests (genres they like)
   */
  app.put("/api/user/interests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { interests } = req.body;

      if (!Array.isArray(interests)) {
        return res.status(400).json({ error: "Interests must be an array" });
      }

      const user = await userService.updateInterests(userId, interests);
      res.json(user);
    } catch (error) {
      console.error("[User API] Error updating interests:", error);
      res.status(500).json({ error: "Failed to update interests" });
    }
  });

  /**
   * GET /api/user/interests
   * Get user's interests
   */
  app.get("/api/user/interests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const interests = await userService.getInterests(userId);
      res.json(interests);
    } catch (error) {
      console.error("[User API] Error fetching interests:", error);
      res.status(500).json({ error: "Failed to fetch interests" });
    }
  });

  /**
   * GET /api/crew-matches
   * Find crew members with shared interests
   */
  app.get("/api/crew-matches", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await userService.findCrewMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("[User API] Error finding crew matches:", error);
      res.status(500).json({ error: "Failed to find crew matches" });
    }
  });

  /**
   * GET /api/friends
   * Get user's friends with interaction counts
   */
  app.get("/api/friends", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await userService.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("[User API] Error fetching friends:", error);
      res.status(500).json({ error: "Failed to fetch friends" });
    }
  });

  /**
   * POST /api/friends/:friendId
   * Add a friend
   */
  app.post("/api/friends/:friendId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friendId = req.params.friendId;
      
      const friendship = await userService.addFriend(userId, friendId);
      res.json(friendship);
    } catch (error) {
      console.error("[User API] Error adding friend:", error);
      res.status(500).json({ error: "Failed to add friend" });
    }
  });

  /**
   * POST /api/friends/:friendId/interact
   * Track an interaction with a friend
   */
  app.post("/api/friends/:friendId/interact", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friendId = req.params.friendId;
      const { type } = req.body;

      await userService.trackInteraction(userId, friendId, type || 'generic');
      res.json({ success: true });
    } catch (error) {
      console.error("[User API] Error tracking interaction:", error);
      res.status(500).json({ error: "Failed to track interaction" });
    }
  });

  /**
   * GET /api/users/search
   * Search for users by name or email
   */
  app.get("/api/users/search", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { q } = req.query;

      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const users = await userService.searchUsers(q, userId);
      res.json(users);
    } catch (error) {
      console.error("[User API] Error searching users:", error);
      res.status(500).json({ error: "Failed to search users" });
    }
  });
}
