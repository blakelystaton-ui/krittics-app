/**
 * MatchmakingService.ts
 * 
 * Quick-Match matchmaking system with interest-based matching
 * Matches 1-3 players with shared interests within 15 seconds
 */

import type { IStorage } from "../models/IStorage";
import type { MatchmakingQueue, InsertMatchmakingQueue } from "@shared/schema";

export interface MatchResult {
  matched: boolean;
  matchedPlayers?: string[]; // Array of user IDs including requester
  gameSessionId?: string;
  waitTimeMs?: number;
}

export class MatchmakingService {
  private static readonly MATCH_TIMEOUT_MS = 15000; // 15 seconds
  private static readonly MAX_PLAYERS_PER_MATCH = 3; // 1-3 players total
  private static readonly MIN_PLAYERS_PER_MATCH = 2; // Minimum 2 players (including requester)

  constructor(private storage: IStorage) {}

  /**
   * Join the matchmaking queue
   * Creates a queue entry that expires in 15 seconds
   * 
   * @param userId - User requesting match
   * @param userInterests - User's hobby interests
   * @returns Queue entry
   */
  async joinQueue(userId: string, userInterests: string[]): Promise<MatchmakingQueue> {
    // Check if user is already in queue
    const existing = await this.storage.getActiveQueueEntry(userId);
    if (existing) {
      // Update expiration time
      return await this.storage.updateQueueEntry(existing.id, {
        expiresAt: new Date(Date.now() + MatchmakingService.MATCH_TIMEOUT_MS),
      });
    }

    // Create new queue entry
    const queueEntry: InsertMatchmakingQueue = {
      userId,
      interests: userInterests,
      status: 'waiting',
      expiresAt: new Date(Date.now() + MatchmakingService.MATCH_TIMEOUT_MS),
    };

    return await this.storage.createQueueEntry(queueEntry);
  }

  /**
   * Attempt to find a match for the user
   * 
   * Matching logic:
   * 1. Find waiting players with at least 1 shared interest
   * 2. Prioritize players with 2+ shared interests
   * 3. Match up to 3 total players (including requester)
   * 4. If no matches after 15 seconds, match randomly
   * 
   * @param userId - User requesting match
   * @returns Match result
   */
  async findMatch(userId: string): Promise<MatchResult> {
    const startTime = Date.now();

    // Get user's queue entry
    const userEntry = await this.storage.getActiveQueueEntry(userId);
    if (!userEntry) {
      return { matched: false };
    }

    // Check if already matched
    if (userEntry.status === 'matched' && userEntry.matchedWith) {
      return {
        matched: true,
        matchedPlayers: userEntry.matchedWith,
        gameSessionId: userEntry.gameSessionId!,
      };
    }

    // Get all waiting players (excluding current user)
    const waitingPlayers = await this.storage.getWaitingPlayers(userId);

    // If no other players waiting, check timeout
    if (waitingPlayers.length === 0) {
      const elapsed = Date.now() - new Date(userEntry.createdAt!).getTime();
      
      if (elapsed >= MatchmakingService.MATCH_TIMEOUT_MS) {
        // Timeout expired, mark as expired
        await this.storage.updateQueueEntry(userEntry.id, { status: 'expired' });
        return { matched: false, waitTimeMs: elapsed };
      }
      
      // Still waiting, no match yet
      return { matched: false, waitTimeMs: elapsed };
    }

    // Find best matches based on shared interests
    const matches = this.findBestMatches(userEntry, waitingPlayers);

    if (matches.length === 0) {
      const elapsed = Date.now() - new Date(userEntry.createdAt!).getTime();
      
      // If timeout expired, match randomly with anyone waiting
      if (elapsed >= MatchmakingService.MATCH_TIMEOUT_MS) {
        return await this.createRandomMatch(userEntry, waitingPlayers);
      }
      
      // Still waiting for better match
      return { matched: false, waitTimeMs: elapsed };
    }

    // Create match with best candidates
    return await this.createMatch(userEntry, matches);
  }

  /**
   * Find best matching players based on shared interests
   * Prioritizes players with 2+ shared interests
   * 
   * @param userEntry - Current user's queue entry
   * @param candidates - Other waiting players
   * @returns Best matching players (up to MAX_PLAYERS - 1)
   */
  private findBestMatches(userEntry: MatchmakingQueue, candidates: MatchmakingQueue[]): MatchmakingQueue[] {
    const userInterests = userEntry.interests || [];

    // Calculate overlap scores for each candidate
    const scored = candidates.map(candidate => {
      const candidateInterests = candidate.interests || [];
      const sharedInterests = userInterests.filter(interest => 
        candidateInterests.includes(interest)
      );

      return {
        candidate,
        sharedInterests,
        score: sharedInterests.length,
      };
    });

    // Filter to candidates with at least 1 shared interest
    const withSharedInterests = scored.filter(s => s.score > 0);

    // Sort by score (descending), then by join time (ascending = FIFO)
    withSharedInterests.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score; // Higher score first
      }
      return new Date(a.candidate.createdAt!).getTime() - new Date(b.candidate.createdAt!).getTime();
    });

    // Return top matches (up to MAX_PLAYERS - 1, since requester counts as 1)
    return withSharedInterests
      .slice(0, MatchmakingService.MAX_PLAYERS_PER_MATCH - 1)
      .map(s => s.candidate);
  }

  /**
   * Create a match with specified players
   * Updates all queue entries to 'matched' status
   * 
   * @param requester - User who requested the match
   * @param matches - Matched players
   * @returns Match result
   */
  private async createMatch(requester: MatchmakingQueue, matches: MatchmakingQueue[]): Promise<MatchResult> {
    const allPlayers = [requester, ...matches];
    const playerIds = allPlayers.map(p => p.userId);

    // Create game session for the match
    const gameSession = await this.storage.createGameSession({
      userId: requester.userId, // Host is the requester
      movieId: null as any, // Movie selected later
      score: 0,
      totalQuestions: 5,
      gameMode: 'krossfire',
      status: 'lobby', // Players in lobby, waiting to start
    });

    // Update all queue entries to 'matched'
    for (const player of allPlayers) {
      await this.storage.updateQueueEntry(player.id, {
        status: 'matched',
        matchedWith: playerIds,
        gameSessionId: gameSession.id,
      });
    }

    const waitTimeMs = Date.now() - new Date(requester.createdAt!).getTime();

    return {
      matched: true,
      matchedPlayers: playerIds,
      gameSessionId: gameSession.id,
      waitTimeMs,
    };
  }

  /**
   * Create random match when timeout expires
   * Matches with first available player regardless of interests
   * 
   * @param requester - User who requested the match
   * @param candidates - All waiting players
   * @returns Match result
   */
  private async createRandomMatch(requester: MatchmakingQueue, candidates: MatchmakingQueue[]): Promise<MatchResult> {
    // Take first available player(s) up to MAX_PLAYERS
    const randomMatches = candidates.slice(0, MatchmakingService.MAX_PLAYERS_PER_MATCH - 1);

    if (randomMatches.length === 0) {
      // No one to match with, mark as expired
      await this.storage.updateQueueEntry(requester.id, { status: 'expired' });
      const waitTimeMs = Date.now() - new Date(requester.createdAt!).getTime();
      return { matched: false, waitTimeMs };
    }

    return await this.createMatch(requester, randomMatches);
  }

  /**
   * Leave the matchmaking queue
   * Removes user from active queue
   * 
   * @param userId - User leaving queue
   */
  async leaveQueue(userId: string): Promise<void> {
    const entry = await this.storage.getActiveQueueEntry(userId);
    if (entry && entry.status === 'waiting') {
      await this.storage.updateQueueEntry(entry.id, { status: 'expired' });
    }
  }

  /**
   * Clean up expired queue entries
   * Should be run periodically to prevent table bloat
   */
  async cleanupExpiredEntries(): Promise<number> {
    return await this.storage.deleteExpiredQueueEntries();
  }
}
