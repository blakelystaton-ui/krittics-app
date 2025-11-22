/**
 * adTargetingRoutes.ts
 * 
 * API routes for interest-based ad targeting
 * Returns personalized ad tags based on user interests
 */

import type { Express } from "express";
import { AdTargetingService } from "../services/AdTargetingService";
import type { IStorage } from "../models/IStorage";
import { isAuthenticated } from "../middleware/auth";

export function registerAdTargetingRoutes(app: Express, storage: IStorage) {
  const adTargetingService = new AdTargetingService();

  /**
   * GET /api/ads/tag
   * Get targeted ad tag URL based on user's interests
   * 
   * Query params:
   *   - movieId (optional): Movie ID to check for movie-specific ad tags
   * 
   * Returns: { adTagUrl: string }
   */
  app.get("/api/ads/tag", async (req, res) => {
    try {
      let userInterests: string[] | undefined;

      // Get user interests if authenticated
      if (req.user) {
        const userId = (req.user as any).claims.sub;
        const user = await storage.getUser(userId);
        userInterests = user?.interests || undefined;
      }

      // Get targeted ad tag (movieAdTag parameter is reserved for future per-movie targeting)
      const adTagUrl = adTargetingService.getTargetedAdTag(userInterests);

      res.json({ adTagUrl });
    } catch (error) {
      console.error("Error getting targeted ad tag:", error);
      res.status(500).json({ error: "Failed to get ad tag" });
    }
  });

  /**
   * GET /api/ads/keywords
   * Get ad keywords for AdSense/banner ads based on user interests
   * 
   * Returns: { keywords: string }
   */
  app.get("/api/ads/keywords", async (req, res) => {
    try {
      let userInterests: string[] | undefined;

      // Get user interests if authenticated
      if (req.user) {
        const userId = (req.user as any).claims.sub;
        const user = await storage.getUser(userId);
        userInterests = user?.interests || undefined;
      }

      // Get ad keywords
      const keywords = adTargetingService.getAdKeywords(userInterests);

      res.json({ keywords });
    } catch (error) {
      console.error("Error getting ad keywords:", error);
      res.status(500).json({ error: "Failed to get keywords" });
    }
  });
}
