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
  answers,
  users,
  leaderboardEntries,
  friendships,
  friendInteractions,
  watchlist,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (REQUIRED for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Movies
  getMovie(id: string): Promise<Movie | undefined>;
  getAllMovies(): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;

  // Game Sessions
  getGameSession(id: string): Promise<GameSession | undefined>;
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession>;
  getSessionsByUser(userId: string): Promise<GameSession[]>;

  // Trivia Questions
  getTriviaQuestion(id: string): Promise<TriviaQuestion | undefined>;
  getQuestionsByMovie(movieId: string): Promise<TriviaQuestion[]>;
  createTriviaQuestion(question: InsertTriviaQuestion): Promise<TriviaQuestion>;
  createManyTriviaQuestions(questions: InsertTriviaQuestion[]): Promise<TriviaQuestion[]>;

  // Answers
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  getAnswersBySession(sessionId: string): Promise<Answer[]>;

  // Leaderboard
  getTopPlayersByMode(gameMode: string, limit?: number, period?: 'daily' | 'weekly' | 'all-time'): Promise<{ userId: string; username: string; totalScore: number; gamesPlayed: number; averageScore: number }[]>;

  // Friends
  getFriendsByUser(userId: string): Promise<(User & { interactionCount: number; lastInteractionAt: Date | null })[]>;
  searchUsers(query: string, excludeUserId?: string): Promise<User[]>;
  addFriend(userId: string, friendId: string): Promise<Friendship>;
  trackInteraction(userId: string, friendId: string, interactionType: string): Promise<void>;

  // Watchlist
  addToWatchlist(userId: string, movieId: string): Promise<void>;
  removeFromWatchlist(userId: string, movieId: string): Promise<void>;
  getWatchlistByUser(userId: string): Promise<Movie[]>;
  isInWatchlist(userId: string, movieId: string): Promise<boolean>;
}

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

  async createManyTriviaQuestions(insertQuestions: InsertTriviaQuestion[]): Promise<TriviaQuestion[]> {
    if (insertQuestions.length === 0) return [];
    return await db.insert(triviaQuestions).values(insertQuestions).returning();
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
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
