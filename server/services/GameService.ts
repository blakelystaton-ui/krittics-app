/**
 * GameService.ts
 * 
 * Business logic for game sessions, scoring, and leaderboard management
 */

import type { IStorage } from "../models/IStorage";
import type { GameSession, InsertGameSession, InsertAnswer } from "@shared/schema";

export interface LeaderboardFilters {
  gameMode: string;
  limit?: number;
  period?: 'daily' | 'weekly' | 'all-time';
}

export class GameService {
  constructor(private storage: IStorage) {}

  /**
   * Create a new game session
   */
  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    return await this.storage.createGameSession(session);
  }

  /**
   * Get a game session by ID
   */
  async getGameSession(id: string): Promise<GameSession | undefined> {
    return await this.storage.getGameSession(id);
  }

  /**
   * Update a game session (e.g., final score, completion status)
   */
  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession> {
    return await this.storage.updateGameSession(id, updates);
  }

  /**
   * Get all sessions for a specific user
   */
  async getUserSessions(userId: string): Promise<GameSession[]> {
    return await this.storage.getSessionsByUser(userId);
  }

  /**
   * Submit an answer to a trivia question
   */
  async submitAnswer(answer: InsertAnswer) {
    return await this.storage.createAnswer(answer);
  }

  /**
   * Get all answers for a specific session
   */
  async getSessionAnswers(sessionId: string) {
    return await this.storage.getAnswersBySession(sessionId);
  }

  /**
   * Get leaderboard rankings
   */
  async getLeaderboard(filters: LeaderboardFilters) {
    return await this.storage.getTopPlayersByMode(
      filters.gameMode,
      filters.limit,
      filters.period
    );
  }

  /**
   * Calculate final score for a session based on correctness and time
   */
  calculateScore(correctAnswers: number, totalQuestions: number, timeSeconds: number): number {
    const baseScore = (correctAnswers / totalQuestions) * 100;
    
    // Time bonus: faster completion = higher score
    const timePenalty = Math.min(timeSeconds / 10, 20); // Max 20 point penalty
    
    return Math.max(0, Math.round(baseScore - timePenalty));
  }
}
