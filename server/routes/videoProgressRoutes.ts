/**
 * videoProgressRoutes.ts
 * 
 * API routes for video progress tracking and "Continue Watching"
 */

import type { Express } from "express";
import { VideoProgressService } from "../services/VideoProgressService";
import type { IStorage } from "../models/IStorage";
import { isAuthenticated } from "../middleware/auth";

export function registerVideoProgressRoutes(app: Express, storage: IStorage) {
  const videoProgressService = new VideoProgressService(storage);

  /**
   * POST /api/video-progress
   * Update video playback progress
   */
  app.post("/api/video-progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { movieId, progressSeconds, completed } = req.body;

      if (!movieId || typeof progressSeconds !== "number") {
        return res.status(400).json({ error: "movieId and progressSeconds are required" });
      }

      await videoProgressService.updateProgress(
        userId,
        movieId,
        progressSeconds,
        completed || false
      );

      res.json({ success: true });
    } catch (error) {
      console.error("[Video Progress API] Error updating progress:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  /**
   * GET /api/video-progress/:movieId
   * Get progress for a specific movie
   */
  app.get("/api/video-progress/:movieId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const movieId = req.params.movieId;

      const progress = await videoProgressService.getProgress(userId, movieId);
      res.json(progress || { progressSeconds: 0, completed: false });
    } catch (error) {
      console.error("[Video Progress API] Error fetching progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  /**
   * GET /api/continue-watching
   * Get all movies user has started but not completed
   */
  app.get("/api/continue-watching", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const continueWatching = await videoProgressService.getContinueWatching(userId);
      res.json(continueWatching);
    } catch (error) {
      console.error("[Video Progress API] Error fetching continue watching:", error);
      res.status(500).json({ error: "Failed to fetch continue watching" });
    }
  });
}
