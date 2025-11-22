/**
 * leaderboardRoutes.ts
 * 
 * API routes for leaderboard (Krossfire) management
 */

import type { Express } from "express";
import { GameService } from "../services/GameService";
import type { IStorage } from "../models/IStorage";

export function registerLeaderboardRoutes(app: Express, storage: IStorage) {
  const gameService = new GameService(storage);

  /**
   * GET /api/leaderboard
   * Get leaderboard rankings
   * Query params: gameMode (required), period (optional), limit (optional)
   */
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { gameMode, period, limit } = req.query;

      if (!gameMode || typeof gameMode !== "string") {
        return res.status(400).json({ error: "gameMode query parameter is required" });
      }

      const leaderboard = await gameService.getLeaderboard({
        gameMode,
        period: (period as 'daily' | 'weekly' | 'all-time') || 'all-time',
        limit: limit ? parseInt(limit as string) : 100,
      });

      res.json(leaderboard);
    } catch (error) {
      console.error("[Leaderboard API] Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
}
