/**
 * matchmakingRoutes.ts
 * 
 * API routes for Quick-Match matchmaking system
 * Endpoints for joining queue, finding matches, leaving queue
 */

import type { Express } from "express";
import { MatchmakingService } from "../services/MatchmakingService";
import type { IStorage } from "../models/IStorage";
import { isAuthenticated } from "../middleware/auth";
import { z } from "zod";

// Validation schemas
const joinQueueSchema = z.object({
  interests: z.array(z.string()).min(1, "At least one interest is required"),
});

export function registerMatchmakingRoutes(app: Express, storage: IStorage) {
  const matchmakingService = new MatchmakingService(storage);

  /**
   * POST /api/matchmaking/join
   * Join the matchmaking queue with user's interests
   * 
   * Body: { interests: string[] }
   * Returns: { queueEntry: MatchmakingQueue }
   */
  app.post("/api/matchmaking/join", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      
      // Validate request body
      const validation = joinQueueSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Interests are required. Please select at least one interest in your profile." 
        });
      }

      const { interests } = validation.data;

      // Join the queue
      const queueEntry = await matchmakingService.joinQueue(userId, interests);

      res.json({ queueEntry });
    } catch (error) {
      console.error("Error joining matchmaking queue:", error);
      res.status(500).json({ error: "Failed to join matchmaking queue" });
    }
  });

  /**
   * GET /api/matchmaking/status
   * Check matchmaking status and attempt to find a match
   * 
   * Returns: { matched: boolean, matchedPlayers?: string[], gameSessionId?: string, waitTimeMs?: number }
   */
  app.get("/api/matchmaking/status", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;

      // Attempt to find a match
      const result = await matchmakingService.findMatch(userId);

      res.json(result);
    } catch (error) {
      console.error("Error checking matchmaking status:", error);
      res.status(500).json({ error: "Failed to check matchmaking status" });
    }
  });

  /**
   * POST /api/matchmaking/leave
   * Leave the matchmaking queue
   * 
   * Returns: { success: boolean }
   */
  app.post("/api/matchmaking/leave", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;

      await matchmakingService.leaveQueue(userId);

      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving matchmaking queue:", error);
      res.status(500).json({ error: "Failed to leave matchmaking queue" });
    }
  });

  /**
   * POST /api/matchmaking/cleanup
   * Admin endpoint to clean up expired queue entries
   * 
   * Returns: { deletedCount: number }
   */
  app.post("/api/matchmaking/cleanup", isAuthenticated, async (req, res) => {
    try {
      const deletedCount = await matchmakingService.cleanupExpiredEntries();

      res.json({ deletedCount });
    } catch (error) {
      console.error("Error cleaning up expired queue entries:", error);
      res.status(500).json({ error: "Failed to clean up queue" });
    }
  });
}
