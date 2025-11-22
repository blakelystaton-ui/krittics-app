/**
 * TriviaService.ts
 * 
 * Core business logic for trivia question management, including:
 * - Question pool management (no-duplicate system)
 * - SHA-256 hash deduplication
 * - Per-movie user history tracking
 * - Automatic pool replenishment via Gemini AI
 * - Concurrent request handling (Mark as Seen Immediately approach)
 */

import type { IStorage } from "../models/IStorage";
import { generateMovieTriviaWithRetry } from "../config/gemini";
import crypto from "crypto";

export interface FreshQuestionsParams {
  userId: string;
  count?: number;
  movieId?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export class TriviaService {
  constructor(private storage: IStorage) {}

  /**
   * Generate a SHA-256 hash from question content for deduplication
   * This prevents the same question from being stored twice
   */
  private generateQuestionHash(question: string, options: string[]): string {
    const content = question + options.join('|');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get fresh trivia questions that the user hasn't seen before
   * 
   * Algorithm:
   * 1. Attempt to reserve questions atomically (marks as seen immediately)
   * 2. If insufficient questions available, check reset threshold (80%+ seen)
   * 3. If reset needed, clear user history for that movie
   * 4. If still insufficient, generate fresh questions via Gemini AI
   * 5. Return requested number of questions (guaranteed no duplicates for sequential requests)
   * 
   * Concurrency: Uses "Mark as Seen Immediately" approach (no transactions needed)
   * Trade-off: Questions "wasted" if user abandons without playing
   */
  async getFreshQuestions(params: FreshQuestionsParams) {
    const {
      userId,
      count = 5,
      movieId,
      category,
      difficulty = 'medium'
    } = params;

    if (!movieId) {
      throw new Error('movieId is required');
    }

    try {
      // Step 1: Try to reserve questions atomically
      let reservedQuestions = await this.storage.reserveQuestionsForUser(
        userId,
        movieId,
        count,
        category,
        difficulty
      );

      // Step 2: If insufficient questions, check if we need to reset or generate
      if (reservedQuestions.length < count) {
        console.log(`[Trivia] Only ${reservedQuestions.length}/${count} available for user ${userId}`);
        
        // Get total available questions in the pool
        const allQuestions = await this.storage.getTriviaQuestionsByFilter({
          movieId,
          category,
          difficulty
        });

        // Calculate per-movie seen percentage
        const movieSeenIds = await this.storage.getUserSeenQuestionsForMovie(userId, movieId);
        const seenPercentage = allQuestions.length > 0 ? (movieSeenIds.length / allQuestions.length) : 0;
        
        // Step 3: Reset history if 80%+ seen
        if (seenPercentage >= 0.8 && allQuestions.length > 0) {
          console.log(`[Trivia] User ${userId} seen ${(seenPercentage * 100).toFixed(0)}% of ${movieId}, resetting history`);
          await this.storage.clearUserSeenQuestions(userId, movieId, category);
          
          // Retry after reset
          reservedQuestions = await this.storage.reserveQuestionsForUser(
            userId,
            movieId,
            count,
            category,
            difficulty
          );
        }
        
        // Step 4: Generate fresh questions if still insufficient
        if (reservedQuestions.length < count) {
          console.log(`[Trivia] Generating new questions for ${movieId}`);
          const movie = await this.storage.getMovie(movieId);
          if (!movie) {
            throw new Error(`Movie ${movieId} not found`);
          }
          
          const currentSeenIds = await this.storage.getUserSeenQuestions(userId);
          
          const freshQuestions = await this.generateAndStoreQuestions(
            movie.title,
            movieId,
            userId,
            currentSeenIds,
            category,
            difficulty
          );
          
          // Retry after generation
          if (freshQuestions.length > 0) {
            reservedQuestions = await this.storage.reserveQuestionsForUser(
              userId,
              movieId,
              count,
              category,
              difficulty
            );
          }
          
          // Final validation
          if (reservedQuestions.length < count) {
            throw new Error(`Unable to generate ${count} questions. Only ${reservedQuestions.length} available.`);
          }
        }
      }

      console.log(`[Trivia] Successfully reserved ${reservedQuestions.length} questions for user ${userId}`);
      return reservedQuestions;
    } catch (error) {
      console.error('[Trivia] Error getting fresh questions:', error);
      throw error;
    }
  }

  /**
   * Generate new questions using Gemini AI and store them in the database
   * Returns only questions that haven't been seen by the user
   */
  private async generateAndStoreQuestions(
    movieTitle: string,
    movieId: string,
    userId: string,
    seenQuestionIds: string[],
    category?: string,
    difficulty: string = 'medium'
  ) {
    const generatedQuestions = await generateMovieTriviaWithRetry(movieTitle);
    const storedQuestions = [];

    for (const q of generatedQuestions) {
      const questionHash = this.generateQuestionHash(q.question, q.options);

      // Upsert handles concurrent inserts gracefully
      const stored = await this.storage.upsertTriviaQuestion({
        movieId,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty,
        category,
        questionHash
      });

      // Only add if user hasn't seen it
      if (!seenQuestionIds.includes(stored.id)) {
        storedQuestions.push(stored);
      }
    }

    return storedQuestions;
  }

  /**
   * Pre-populate trivia pool with questions for popular categories
   * Called on server startup or via admin endpoint
   */
  async populateTriviaPool() {
    const movies = await this.storage.getAllMovies();
    const categories = ['sci-fi', 'comedy', 'drama', 'action'];
    
    for (const movie of movies) {
      const category = movie.genre?.toLowerCase();
      if (category && categories.includes(category)) {
        console.log(`[Trivia] Populating pool for ${movie.title} (${category})`);
        
        try {
          const generated = await generateMovieTriviaWithRetry(movie.title);

          for (const q of generated) {
            const questionHash = this.generateQuestionHash(q.question, q.options);
            
            await this.storage.upsertTriviaQuestion({
              movieId: movie.id,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              difficulty: 'medium',
              category,
              questionHash
            });
          }
        } catch (error) {
          console.error(`[Trivia] Failed to generate questions for ${movie.title}:`, error);
        }
      }
    }
  }

  /**
   * Fisher-Yates shuffle algorithm for randomizing question order
   */
  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
