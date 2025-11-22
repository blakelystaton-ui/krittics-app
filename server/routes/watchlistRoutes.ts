/**
 * watchlistRoutes.ts
 * 
 * API routes for watchlist (Queue) management
 */

import type { Express } from "express";
import { WatchlistService } from "../services/WatchlistService";
import type { IStorage } from "../models/IStorage";
import { isAuthenticated } from "../middleware/auth";

export function registerWatchlistRoutes(app: Express, storage: IStorage) {
  const watchlistService = new WatchlistService(storage);

  /**
   * GET /api/watchlist
   * Get user's watchlist
   */
  app.get("/api/watchlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const watchlist = await watchlistService.getWatchlist(userId);
      res.json(watchlist);
    } catch (error) {
      console.error("[Watchlist API] Error fetching watchlist:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  /**
   * POST /api/watchlist/:movieId
   * Add a movie to watchlist
   */
  app.post("/api/watchlist/:movieId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const movieId = req.params.movieId;
      
      await watchlistService.addToWatchlist(userId, movieId);
      res.json({ success: true });
    } catch (error) {
      console.error("[Watchlist API] Error adding to watchlist:", error);
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  /**
   * DELETE /api/watchlist/:movieId
   * Remove a movie from watchlist
   */
  app.delete("/api/watchlist/:movieId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const movieId = req.params.movieId;
      
      await watchlistService.removeFromWatchlist(userId, movieId);
      res.json({ success: true });
    } catch (error) {
      console.error("[Watchlist API] Error removing from watchlist:", error);
      res.status(500).json({ error: "Failed to remove from watchlist" });
    }
  });

  /**
   * GET /api/watchlist/:movieId/check
   * Check if a movie is in watchlist
   */
  app.get("/api/watchlist/:movieId/check", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const movieId = req.params.movieId;
      
      const isInWatchlist = await watchlistService.isInWatchlist(userId, movieId);
      res.json({ isInWatchlist });
    } catch (error) {
      console.error("[Watchlist API] Error checking watchlist:", error);
      res.status(500).json({ error: "Failed to check watchlist" });
    }
  });
}
