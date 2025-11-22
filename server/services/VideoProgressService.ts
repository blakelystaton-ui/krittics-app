/**
 * VideoProgressService.ts
 * 
 * Business logic for video playback progress tracking and "Continue Watching" feature
 */

import type { IStorage } from "../models/IStorage";
import type { Movie } from "@shared/schema";

export class VideoProgressService {
  constructor(private storage: IStorage) {}

  /**
   * Update user's video playback progress
   * 
   * @param userId - User ID
   * @param movieId - Movie ID
   * @param progressSeconds - Current playback position in seconds
   * @param completed - Whether the video was completed
   */
  async updateProgress(
    userId: string, 
    movieId: string, 
    progressSeconds: number, 
    completed: boolean
  ): Promise<void> {
    await this.storage.updateVideoProgress(userId, movieId, progressSeconds, completed);
  }

  /**
   * Get user's progress for a specific movie
   */
  async getProgress(userId: string, movieId: string) {
    return await this.storage.getVideoProgress(userId, movieId);
  }

  /**
   * Get all movies the user has started but not completed
   * Used for "Continue Watching" row on homepage
   */
  async getContinueWatching(userId: string): Promise<(Movie & { progressSeconds: number; progressPercentage: number })[]> {
    return await this.storage.getContinueWatching(userId);
  }

  /**
   * Determine if "Continue Watching" button should be shown
   * Show if: progress >= 15 seconds AND not completed
   */
  shouldShowContinueButton(progressSeconds: number, completed: boolean, duration: number): boolean {
    return progressSeconds >= 15 && !completed && progressSeconds < duration - 30;
  }

  /**
   * Calculate progress percentage
   */
  calculateProgressPercentage(progressSeconds: number, duration: number): number {
    if (duration === 0) return 0;
    return Math.min(100, Math.round((progressSeconds / duration) * 100));
  }
}
