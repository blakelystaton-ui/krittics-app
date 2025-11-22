/**
 * storage.ts
 * 
 * Main storage implementation using PostgreSQL via Drizzle ORM
 * Implements IStorage interface for all database operations
 */

import {
  type Movie,
  type InsertMovie,
  type GameSession,
  type InsertGameSession,
  type TriviaQuestion,
  type InsertTriviaQuestion,
  type Answer,
  type InsertAnswer,
  type User,
  type InsertUser,
  type UpsertUser,
  type Friendship,
  type InsertFriendship,
  type FriendInteraction,
  type InsertFriendInteraction,
  movies,
  gameSessions,
  triviaQuestions,
  userSeenQuestions,
  answers,
  users,
  leaderboardEntries,
  friendships,
  friendInteractions,
  watchlist,
  videoProgress,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./config/db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import type { IStorage } from "./models/IStorage";

export class MemStorage implements IStorage {
  private movies: Map<string, Movie>;
  private gameSessions: Map<string, GameSession>;
  private triviaQuestions: Map<string, TriviaQuestion>;
  private answers: Map<string, Answer>;

  constructor() {
    this.movies = new Map();
    this.gameSessions = new Map();
    this.triviaQuestions = new Map();
    this.answers = new Map();

    // Initialize with a sample movie
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleMovie: Movie = {
      id: "1",
      title: "The Grand Adventure of Elias",
      description: "An epic journey through magical lands filled with wonder, danger, and self-discovery.",
      duration: 7200,
      genre: null,
      year: null,
      rating: null,
      posterUrl: null,
      videoUrl: null,
    };
    this.movies.set(sampleMovie.id, sampleMovie);
  }

  // User operations (stub - not implemented for in-memory)
  async getUser(id: string): Promise<User | undefined> {
    throw new Error("MemStorage does not support user operations");
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    throw new Error("MemStorage does not support user operations");
  }

  // Movies
  async getMovie(id: string): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async getAllMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = randomUUID();
    const movie: Movie = { 
      ...insertMovie, 
      id,
      description: insertMovie.description ?? null,
      genre: insertMovie.genre ?? null,
      year: insertMovie.year ?? null,
      rating: insertMovie.rating ?? null,
      posterUrl: insertMovie.posterUrl ?? null,
      videoUrl: insertMovie.videoUrl ?? null,
    };
    this.movies.set(id, movie);
    return movie;
  }

  // Game Sessions
  async getGameSession(id: string): Promise<GameSession | undefined> {
    return this.gameSessions.get(id);
  }

  async createGameSession(insertSession: InsertGameSession): Promise<GameSession> {
    const id = randomUUID();
    const now = new Date();
    const session: GameSession = {
      ...insertSession,
      id,
      movieId: insertSession.movieId ?? null,
      status: insertSession.status ?? 'playing',
      score: insertSession.score ?? 0,
      totalQuestions: insertSession.totalQuestions ?? 5,
      createdAt: now,
      completedAt: null,
    };
    this.gameSessions.set(id, session);
    return session;
  }

  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession> {
    const existing = this.gameSessions.get(id);
    if (!existing) {
      throw new Error(`Game session ${id} not found`);
    }
    const updated = { ...existing, ...updates };
    this.gameSessions.set(id, updated);
    return updated;
  }

  async getSessionsByUser(userId: string): Promise<GameSession[]> {
    return Array.from(this.gameSessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  // Trivia Questions
  async getTriviaQuestion(id: string): Promise<TriviaQuestion | undefined> {
    return this.triviaQuestions.get(id);
  }

  async getQuestionsByMovie(movieId: string): Promise<TriviaQuestion[]> {
    return Array.from(this.triviaQuestions.values()).filter(
      (q) => q.movieId === movieId
    );
  }

  async createTriviaQuestion(insertQuestion: InsertTriviaQuestion): Promise<TriviaQuestion> {
    const id = randomUUID();
    const question: TriviaQuestion = {
      ...insertQuestion,
      id,
      movieId: insertQuestion.movieId ?? null,
      createdAt: new Date(),
    };
    this.triviaQuestions.set(id, question);
    return question;
  }

  async createManyTriviaQuestions(insertQuestions: InsertTriviaQuestion[]): Promise<TriviaQuestion[]> {
    return Promise.all(insertQuestions.map((q) => this.createTriviaQuestion(q)));
  }

  async getTriviaQuestionsByFilter(filter: { movieId?: string; category?: string; difficulty?: string }): Promise<TriviaQuestion[]> {
    throw new Error("MemStorage does not support trivia question pool features");
  }

  async getTriviaQuestionByHash(hash: string): Promise<TriviaQuestion | undefined> {
    throw new Error("MemStorage does not support trivia question pool features");
  }

  async upsertTriviaQuestion(insertQuestion: InsertTriviaQuestion): Promise<TriviaQuestion> {
    throw new Error("MemStorage does not support trivia question pool features");
  }

  async getUserSeenQuestions(userId: string): Promise<string[]> {
    throw new Error("MemStorage does not support trivia question pool features");
  }

  async getUserSeenQuestionsForMovie(userId: string, movieId: string): Promise<string[]> {
    throw new Error("MemStorage does not support trivia question pool features");
  }

  async markQuestionsAsSeen(userId: string, questionIds: string[]): Promise<void> {
    throw new Error("MemStorage does not support trivia question pool features");
  }

  async clearUserSeenQuestions(userId: string, movieId?: string, category?: string): Promise<void> {
    throw new Error("MemStorage does not support trivia question pool features");
  }

  async reserveQuestionsForUser(userId: string, movieId: string, count: number, category?: string, difficulty?: string): Promise<TriviaQuestion[]> {
    throw new Error("MemStorage does not support trivia question pool features");
  }

  // Answers
  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const id = randomUUID();
    const answer: Answer = {
      ...insertAnswer,
      id,
      sessionId: insertAnswer.sessionId ?? null,
      questionId: insertAnswer.questionId ?? null,
      answeredAt: new Date(),
    };
    this.answers.set(id, answer);
    return answer;
  }

  async getAnswersBySession(sessionId: string): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(
      (a) => a.sessionId === sessionId
    );
  }

  // Friends (stub - not implemented for in-memory)
  async getFriendsByUser(userId: string): Promise<(User & { interactionCount: number; lastInteractionAt: Date | null })[]> {
    throw new Error("MemStorage does not support friend operations");
  }

  async searchUsers(query: string, excludeUserId?: string): Promise<User[]> {
    throw new Error("MemStorage does not support user search");
  }

  async addFriend(userId: string, friendId: string): Promise<Friendship> {
    throw new Error("MemStorage does not support friend operations");
  }

  async trackInteraction(userId: string, friendId: string, interactionType: string): Promise<void> {
    throw new Error("MemStorage does not support friend operations");
  }

  // Watchlist (stub - not implemented for in-memory)
  async addToWatchlist(userId: string, movieId: string): Promise<void> {
    throw new Error("MemStorage does not support watchlist operations");
  }

  async removeFromWatchlist(userId: string, movieId: string): Promise<void> {
    throw new Error("MemStorage does not support watchlist operations");
  }

  async getWatchlistByUser(userId: string): Promise<Movie[]> {
    throw new Error("MemStorage does not support watchlist operations");
  }

  async isInWatchlist(userId: string, movieId: string): Promise<boolean> {
    throw new Error("MemStorage does not support watchlist operations");
  }

  // User Interests operations (stub - not implemented for in-memory)
  async updateUserInterests(userId: string, interests: string[]): Promise<User> {
    throw new Error("MemStorage does not support user interests operations");
  }

  async getUserInterests(userId: string): Promise<string[]> {
    throw new Error("MemStorage does not support user interests operations");
  }

  async findCrewByInterests(userId: string): Promise<(User & { sharedInterests: string[] })[]> {
    throw new Error("MemStorage does not support crew matching operations");
  }

  // Leaderboard
  async getTopPlayersByMode(
    gameMode: string,
    limit: number = 10,
    period: 'daily' | 'weekly' | 'all-time' = 'all-time'
  ): Promise<{ userId: string; username: string; totalScore: number; gamesPlayed: number; averageScore: number }[]> {
    // Calculate date cutoff based on period
    let cutoffDate: Date | null = null;
    if (period === 'daily') {
      cutoffDate = new Date();
      cutoffDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);
    }

    const sessions = Array.from(this.gameSessions.values()).filter(
      (s) => {
        if (s.gameMode !== gameMode || s.status !== "completed") return false;
        if (cutoffDate && s.createdAt && s.createdAt < cutoffDate) return false;
        return true;
      }
    );

    const playerStats = new Map<string, { totalScore: number; gamesPlayed: number }>();

    for (const session of sessions) {
      const existing = playerStats.get(session.userId) || { totalScore: 0, gamesPlayed: 0 };
      playerStats.set(session.userId, {
        totalScore: existing.totalScore + session.score,
        gamesPlayed: existing.gamesPlayed + 1,
      });
    }

    return Array.from(playerStats.entries())
      .map(([userId, stats]) => ({
        userId,
        username: 'Player ' + userId.substring(0, 8),
        totalScore: stats.totalScore,
        gamesPlayed: stats.gamesPlayed,
        averageScore: Math.round(stats.totalScore / stats.gamesPlayed),
      }))
      .sort((a, b) => {
        // Primary sort by total score (descending)
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        // Secondary sort by username (ascending) for deterministic ordering of ties
        return a.username.localeCompare(b.username);
      })
      .slice(0, limit);
  }
}

export class DatabaseStorage implements IStorage {
  // User operations (REQUIRED for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Movies
  async getMovie(id: string): Promise<Movie | undefined> {
    const result = await db.select({
      id: movies.id,
      title: movies.title,
      description: movies.description,
      duration: movies.duration,
      genre: movies.genre,
      year: movies.year,
      rating: movies.rating,
      posterUrl: movies.posterUrl,
      videoUrl: movies.videoUrl,
    }).from(movies).where(eq(movies.id, id)).limit(1);
    return result[0];
  }

  async getAllMovies(): Promise<Movie[]> {
    return await db.select({
      id: movies.id,
      title: movies.title,
      description: movies.description,
      duration: movies.duration,
      genre: movies.genre,
      year: movies.year,
      rating: movies.rating,
      posterUrl: movies.posterUrl,
      videoUrl: movies.videoUrl,
    }).from(movies);
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const result = await db.insert(movies).values(insertMovie).returning();
    return result[0];
  }

  // Game Sessions
  async getGameSession(id: string): Promise<GameSession | undefined> {
    const result = await db.select().from(gameSessions).where(eq(gameSessions.id, id)).limit(1);
    return result[0];
  }

  async createGameSession(insertSession: InsertGameSession): Promise<GameSession> {
    const result = await db.insert(gameSessions).values(insertSession).returning();
    return result[0];
  }

  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession> {
    const result = await db
      .update(gameSessions)
      .set(updates)
      .where(eq(gameSessions.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error(`Game session ${id} not found`);
    }
    return result[0];
  }

  async getSessionsByUser(userId: string): Promise<GameSession[]> {
    return await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.userId, userId))
      .orderBy(desc(gameSessions.createdAt));
  }

  // Trivia Questions
  async getTriviaQuestion(id: string): Promise<TriviaQuestion | undefined> {
    const result = await db.select().from(triviaQuestions).where(eq(triviaQuestions.id, id)).limit(1);
    return result[0];
  }

  async getQuestionsByMovie(movieId: string): Promise<TriviaQuestion[]> {
    return await db
      .select()
      .from(triviaQuestions)
      .where(eq(triviaQuestions.movieId, movieId));
  }

  async createTriviaQuestion(insertQuestion: InsertTriviaQuestion): Promise<TriviaQuestion> {
    const result = await db.insert(triviaQuestions).values(insertQuestion).returning();
    return result[0];
  }

  async upsertTriviaQuestion(insertQuestion: InsertTriviaQuestion): Promise<TriviaQuestion> {
    // Try to insert, ignore conflicts
    const result = await db
      .insert(triviaQuestions)
      .values(insertQuestion)
      .onConflictDoNothing()
      .returning();
    
    // If conflict occurred (empty result), fetch the existing question by hash
    if (result.length === 0) {
      const existing = await this.getTriviaQuestionByHash(insertQuestion.questionHash!);
      if (!existing) {
        throw new Error('Upsert failed: question not found after conflict');
      }
      return existing;
    }
    
    return result[0];
  }

  async createManyTriviaQuestions(insertQuestions: InsertTriviaQuestion[]): Promise<TriviaQuestion[]> {
    if (insertQuestions.length === 0) return [];
    return await db.insert(triviaQuestions).values(insertQuestions).returning();
  }

  async getTriviaQuestionsByFilter(filter: { movieId?: string; category?: string; difficulty?: string }): Promise<TriviaQuestion[]> {
    const conditions = [];
    if (filter.movieId) {
      conditions.push(eq(triviaQuestions.movieId, filter.movieId));
    }
    if (filter.category) {
      conditions.push(eq(triviaQuestions.category, filter.category));
    }
    if (filter.difficulty) {
      conditions.push(eq(triviaQuestions.difficulty, filter.difficulty));
    }
    
    // Handle 0, 1, or multiple conditions properly
    if (conditions.length === 0) {
      return await db.select().from(triviaQuestions);
    } else if (conditions.length === 1) {
      return await db.select().from(triviaQuestions).where(conditions[0]);
    } else {
      return await db.select().from(triviaQuestions).where(and(...conditions));
    }
  }

  async getTriviaQuestionByHash(hash: string): Promise<TriviaQuestion | undefined> {
    const result = await db
      .select()
      .from(triviaQuestions)
      .where(eq(triviaQuestions.questionHash, hash))
      .limit(1);
    return result[0];
  }

  async getUserSeenQuestions(userId: string): Promise<string[]> {
    const { userSeenQuestions } = await import("@shared/schema");
    const result = await db
      .select({ questionId: userSeenQuestions.questionId })
      .from(userSeenQuestions)
      .where(eq(userSeenQuestions.userId, userId));
    return result.map(r => r.questionId);
  }

  /**
   * Get seen questions for a specific movie (for per-movie reset logic)
   */
  async getUserSeenQuestionsForMovie(userId: string, movieId: string): Promise<string[]> {
    // Get all questions for this movie
    const movieQuestions = await db
      .select({ id: triviaQuestions.id })
      .from(triviaQuestions)
      .where(eq(triviaQuestions.movieId, movieId));
    const movieQuestionIds = movieQuestions.map(q => q.id);
    
    if (movieQuestionIds.length === 0) return [];
    
    // Get user's seen questions that are from this movie
    const seenResult = await db
      .select({ questionId: userSeenQuestions.questionId })
      .from(userSeenQuestions)
      .where(
        and(
          eq(userSeenQuestions.userId, userId),
          inArray(userSeenQuestions.questionId, movieQuestionIds)
        )
      );
    
    return seenResult.map(r => r.questionId);
  }

  async markQuestionsAsSeen(userId: string, questionIds: string[]): Promise<void> {
    if (questionIds.length === 0) return;
    
    const values = questionIds.map(questionId => ({
      userId,
      questionId
    }));
    
    // ON CONFLICT DO NOTHING handles concurrent/duplicate inserts gracefully
    await db.insert(userSeenQuestions).values(values).onConflictDoNothing();
  }

  /**
   * Reserve questions for a user (WITHOUT transactions - neon-http doesn't support them)
   * Marks questions as seen BEFORE returning them to prevent concurrent duplicates
   * Trade-off: If user abandons without playing, questions are "wasted"
   */
  async reserveQuestionsForUser(
    userId: string,
    movieId: string,
    count: number,
    category?: string,
    difficulty?: string
  ): Promise<TriviaQuestion[]> {
    // Step 1: Get user's seen questions
    const seenResult = await db
      .select({ questionId: userSeenQuestions.questionId })
      .from(userSeenQuestions)
      .where(eq(userSeenQuestions.userId, userId));
    const seenIds = seenResult.map(r => r.questionId);
    
    // Step 2: Build query for unseen questions
    const conditions = [eq(triviaQuestions.movieId, movieId)];
    if (category) conditions.push(eq(triviaQuestions.category, category));
    if (difficulty) conditions.push(eq(triviaQuestions.difficulty, difficulty));
    
    let query = db.select().from(triviaQuestions);
    
    // Apply WHERE conditions
    if (conditions.length === 1) {
      query = query.where(conditions[0]);
    } else {
      query = query.where(and(...conditions));
    }
    
    // Exclude seen questions
    if (seenIds.length > 0) {
      query = query.where(sql`${triviaQuestions.id} NOT IN ${seenIds}`);
    }
    
    // Step 3: Select random unseen questions
    const selectedQuestions = await query
      .orderBy(sql`RANDOM()`)
      .limit(count);
    
    // Step 4: Mark as seen IMMEDIATELY (before returning)
    // This prevents concurrent requests from getting the same questions
    // Trade-off: Questions are "wasted" if user abandons without playing
    if (selectedQuestions.length > 0) {
      const values = selectedQuestions.map(q => ({
        userId,
        questionId: q.id
      }));
      await db.insert(userSeenQuestions).values(values).onConflictDoNothing();
    }
    
    return selectedQuestions;
  }

  async clearUserSeenQuestions(userId: string, movieId?: string, category?: string): Promise<void> {
    const { userSeenQuestions } = await import("@shared/schema");
    
    if (!movieId && !category) {
      // Clear all seen questions for this user
      await db.delete(userSeenQuestions).where(eq(userSeenQuestions.userId, userId));
    } else {
      // Clear only questions matching the criteria
      const matchingQuestions = await this.getTriviaQuestionsByFilter({ movieId, category });
      const questionIds = matchingQuestions.map(q => q.id);
      
      if (questionIds.length > 0) {
        await db
          .delete(userSeenQuestions)
          .where(
            and(
              eq(userSeenQuestions.userId, userId),
              inArray(userSeenQuestions.questionId, questionIds)
            )
          );
      }
    }
  }

  // Answers
  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const result = await db.insert(answers).values(insertAnswer).returning();
    return result[0];
  }

  async getAnswersBySession(sessionId: string): Promise<Answer[]> {
    return await db
      .select()
      .from(answers)
      .where(eq(answers.sessionId, sessionId));
  }

  // Leaderboard
  async getTopPlayersByMode(
    gameMode: string,
    limit: number = 10,
    period: 'daily' | 'weekly' | 'all-time' = 'all-time'
  ): Promise<{ userId: string; username: string; totalScore: number; gamesPlayed: number; averageScore: number }[]> {
    // Calculate date cutoff based on period
    let cutoffDate: Date | null = null;
    if (period === 'daily') {
      cutoffDate = new Date();
      cutoffDate.setHours(0, 0, 0, 0); // Start of today
    } else if (period === 'weekly') {
      cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days ago
    }

    // Aggregate from game sessions (not leaderboard_entries table)
    const conditions = [
      eq(gameSessions.gameMode, gameMode),
      eq(gameSessions.status, "completed")
    ];

    if (cutoffDate) {
      conditions.push(sql`${gameSessions.createdAt} >= ${cutoffDate.toISOString()}`);
    }

    const sessions = await db
      .select()
      .from(gameSessions)
      .where(and(...conditions));

    const playerStats = new Map<string, { totalScore: number; gamesPlayed: number }>();

    for (const session of sessions) {
      const existing = playerStats.get(session.userId) || { totalScore: 0, gamesPlayed: 0 };
      playerStats.set(session.userId, {
        totalScore: existing.totalScore + session.score,
        gamesPlayed: existing.gamesPlayed + 1,
      });
    }

    // Get user data for all players
    const userIds = Array.from(playerStats.keys());
    const usersData = await db
      .select()
      .from(users)
      .where(sql`${users.id} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`);

    const userMap = new Map(usersData.map(u => [u.id, u]));

    return Array.from(playerStats.entries())
      .map(([userId, stats]) => {
        const user = userMap.get(userId);
        const username = user 
          ? (user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.email || 'Unknown Player')
          : 'Unknown Player';
        
        return {
          userId,
          username,
          totalScore: stats.totalScore,
          gamesPlayed: stats.gamesPlayed,
          averageScore: Math.round(stats.totalScore / stats.gamesPlayed),
        };
      })
      .sort((a, b) => {
        // Primary sort by total score (descending)
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        // Secondary sort by username (ascending) for deterministic ordering of ties
        return a.username.localeCompare(b.username);
      })
      .slice(0, limit);
  }

  // Friends
  async getFriendsByUser(userId: string): Promise<(User & { interactionCount: number; lastInteractionAt: Date | null })[]> {
    const friendList = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        interests: users.interests,
        hasCompletedOnboarding: users.hasCompletedOnboarding,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        interactionCount: sql<number>`COALESCE(${friendInteractions.interactionCount}, 0)`,
        lastInteractionAt: friendInteractions.lastInteractionAt,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.friendId, users.id))
      .leftJoin(
        friendInteractions,
        and(
          eq(friendInteractions.userId, userId),
          eq(friendInteractions.friendId, users.id)
        )
      )
      .where(
        and(
          eq(friendships.userId, userId),
          eq(friendships.status, 'accepted')
        )
      )
      .orderBy(desc(sql`COALESCE(${friendInteractions.interactionCount}, 0)`))
      .limit(10);

    return friendList;
  }

  async searchUsers(query: string, excludeUserId?: string): Promise<User[]> {
    const searchPattern = `%${query}%`;
    const conditions = [
      sql`(${users.email} ILIKE ${searchPattern} OR ${users.firstName} ILIKE ${searchPattern} OR ${users.lastName} ILIKE ${searchPattern})`
    ];

    if (excludeUserId) {
      conditions.push(sql`${users.id} != ${excludeUserId}`);
    }

    return await db
      .select()
      .from(users)
      .where(and(...conditions))
      .limit(20);
  }

  async addFriend(userId: string, friendId: string): Promise<Friendship> {
    const [friendship] = await db
      .insert(friendships)
      .values({
        userId,
        friendId,
        status: 'accepted',
      })
      .onConflictDoNothing()
      .returning();

    // Also create reverse friendship for bidirectional access
    await db
      .insert(friendships)
      .values({
        userId: friendId,
        friendId: userId,
        status: 'accepted',
      })
      .onConflictDoNothing();

    return friendship;
  }

  async trackInteraction(userId: string, friendId: string, interactionType: string): Promise<void> {
    const existing = await db
      .select()
      .from(friendInteractions)
      .where(
        and(
          eq(friendInteractions.userId, userId),
          eq(friendInteractions.friendId, friendId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(friendInteractions)
        .set({
          interactionCount: sql`${friendInteractions.interactionCount} + 1`,
          lastInteractionAt: new Date(),
        })
        .where(
          and(
            eq(friendInteractions.userId, userId),
            eq(friendInteractions.friendId, friendId)
          )
        );
    } else {
      await db.insert(friendInteractions).values({
        userId,
        friendId,
        interactionType,
        interactionCount: 1,
      });
    }
  }

  // Watchlist operations
  async addToWatchlist(userId: string, movieId: string): Promise<void> {
    await db
      .insert(watchlist)
      .values({
        userId,
        movieId,
      })
      .onConflictDoNothing();
  }

  async removeFromWatchlist(userId: string, movieId: string): Promise<void> {
    await db
      .delete(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.movieId, movieId)
        )
      );
  }

  async getWatchlistByUser(userId: string): Promise<Movie[]> {
    const result = await db
      .select({
        id: movies.id,
        title: movies.title,
        description: movies.description,
        duration: movies.duration,
        genre: movies.genre,
        year: movies.year,
        rating: movies.rating,
        posterUrl: movies.posterUrl,
        videoUrl: movies.videoUrl,
      })
      .from(watchlist)
      .innerJoin(movies, eq(watchlist.movieId, movies.id))
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.addedAt));

    return result;
  }

  async isInWatchlist(userId: string, movieId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.movieId, movieId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // User Interests operations
  async updateUserInterests(userId: string, interests: string[]): Promise<User> {
    const result = await db
      .update(users)
      .set({
        interests,
        hasCompletedOnboarding: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (result.length === 0) {
      throw new Error("User not found");
    }

    return result[0];
  }

  async getUserInterests(userId: string): Promise<string[]> {
    const result = await db
      .select({ interests: users.interests })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result[0]?.interests || [];
  }

  async findCrewByInterests(userId: string): Promise<(User & { sharedInterests: string[] })[]> {
    // Get current user's interests
    const currentUserInterests = await this.getUserInterests(userId);
    
    if (currentUserInterests.length === 0) {
      return [];
    }

    // Fetch all users who completed onboarding (excluding current user)
    // Filter and sort in JavaScript for security and simplicity
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        interests: users.interests,
        hasCompletedOnboarding: users.hasCompletedOnboarding,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(
        and(
          sql`${users.id} != ${userId}`,
          eq(users.hasCompletedOnboarding, true),
          sql`${users.interests} IS NOT NULL`
        )
      );

    // Compute shared interests, filter, and sort in JavaScript
    const matchesWithShared = allUsers
      .map((user) => {
        const sharedInterests = (user.interests || []).filter(interest =>
          currentUserInterests.includes(interest)
        );
        return {
          ...user,
          sharedInterests,
        };
      })
      .filter(match => match.sharedInterests.length > 0)
      .sort((a, b) => b.sharedInterests.length - a.sharedInterests.length)
      .slice(0, 20);

    return matchesWithShared;
  }

  // Video Progress operations
  async updateVideoProgress(
    userId: string,
    movieId: string,
    progressSeconds: number,
    completed: boolean
  ): Promise<any> {
    // Check if progress entry exists
    const existing = await db
      .select()
      .from(videoProgress)
      .where(
        and(
          eq(videoProgress.userId, userId),
          eq(videoProgress.movieId, movieId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      const result = await db
        .update(videoProgress)
        .set({
          progressSeconds,
          completed,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(videoProgress.userId, userId),
            eq(videoProgress.movieId, movieId)
          )
        )
        .returning();
      return result[0];
    } else {
      // Insert new
      const result = await db
        .insert(videoProgress)
        .values({
          userId,
          movieId,
          progressSeconds,
          completed,
        })
        .returning();
      return result[0];
    }
  }

  async getVideoProgress(userId: string, movieId: string): Promise<any> {
    const result = await db
      .select()
      .from(videoProgress)
      .where(
        and(
          eq(videoProgress.userId, userId),
          eq(videoProgress.movieId, movieId)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  async getContinueWatching(userId: string): Promise<(Movie & { progressSeconds: number; progressPercentage: number })[]> {
    // Get in-progress movies (not completed, with progress > 0)
    // Limited to 8, sorted by most recently updated
    const result = await db
      .select({
        id: movies.id,
        title: movies.title,
        description: movies.description,
        tagline: movies.tagline,
        director: movies.director,
        cast: movies.cast,
        duration: movies.duration,
        genre: movies.genre,
        year: movies.year,
        rating: movies.rating,
        posterUrl: movies.posterUrl,
        videoUrl: movies.videoUrl,
        studio: movies.studio,
        country: movies.country,
        language: movies.language,
        awards: movies.awards,
        progressSeconds: videoProgress.progressSeconds,
      })
      .from(videoProgress)
      .innerJoin(movies, eq(videoProgress.movieId, movies.id))
      .where(
        and(
          eq(videoProgress.userId, userId),
          eq(videoProgress.completed, false),
          sql`${videoProgress.progressSeconds} > 0`
        )
      )
      .orderBy(desc(videoProgress.updatedAt))
      .limit(8);

    // Calculate progress percentage
    return result.map((item) => ({
      ...item,
      progressPercentage: item.duration > 0 
        ? Math.round((item.progressSeconds / item.duration) * 100)
        : 0,
    }));
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
