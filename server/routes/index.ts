/**
 * routes/index.ts
 * 
 * Consolidated router - registers all API routes
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "../storage";
import { setupAuth } from "../middleware/auth";
import { setupAuthRoutes } from "./authRoutes";
import { registerMovieRoutes } from "./movieRoutes";
import { registerTriviaRoutes } from "./triviaRoutes";
import { registerUserRoutes } from "./userRoutes";
import { registerWatchlistRoutes } from "./watchlistRoutes";
import { registerVideoProgressRoutes } from "./videoProgressRoutes";
import { registerLeaderboardRoutes } from "./leaderboardRoutes";
import { registerMatchmakingRoutes } from "./matchmakingRoutes";
import { registerAdTargetingRoutes } from "./adTargetingRoutes";

/**
 * Register all API routes and setup authentication
 * Returns HTTP server instance for WebSocket support
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware (MUST be first)
  await setupAuth(app);

  // Setup new email/password authentication routes
  setupAuthRoutes(app);

  // Register all route modules
  registerMovieRoutes(app, storage);
  registerTriviaRoutes(app, storage);
  registerUserRoutes(app, storage);
  registerWatchlistRoutes(app, storage);
  registerVideoProgressRoutes(app, storage);
  registerLeaderboardRoutes(app, storage);
  registerMatchmakingRoutes(app, storage);
  registerAdTargetingRoutes(app, storage);

  // Create HTTP server for potential WebSocket support
  const server = createServer(app);
  
  return server;
}
