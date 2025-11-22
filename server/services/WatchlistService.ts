/**
 * WatchlistService.ts
 * 
 * Business logic for user watchlist (Queue) management
 */

import type { IStorage } from "../models/IStorage";
import type { Movie } from "@shared/schema";

export class WatchlistService {
  constructor(private storage: IStorage) {}

  /**
   * Add a movie to user's watchlist
   */
  async addToWatchlist(userId: string, movieId: string): Promise<void> {
    await this.storage.addToWatchlist(userId, movieId);
  }

  /**
   * Remove a movie from user's watchlist
   */
  async removeFromWatchlist(userId: string, movieId: string): Promise<void> {
    await this.storage.removeFromWatchlist(userId, movieId);
  }

  /**
   * Get all movies in user's watchlist
   */
  async getWatchlist(userId: string): Promise<Movie[]> {
    return await this.storage.getWatchlistByUser(userId);
  }

  /**
   * Check if a movie is in user's watchlist
   */
  async isInWatchlist(userId: string, movieId: string): Promise<boolean> {
    return await this.storage.isInWatchlist(userId, movieId);
  }
}
