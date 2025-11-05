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
  movies,
  gameSessions,
  triviaQuestions,
  answers,
  users,
  leaderboardEntries,
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
    const movie: Movie = { ...insertMovie, id };
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
        if (cutoffDate && s.createdAt < cutoffDate) return false;
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
    const result = await db.select().from(movies).where(eq(movies.id, id)).limit(1);
    return result[0];
  }

  async getAllMovies(): Promise<Movie[]> {
    return await db.select().from(movies);
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
      .map(([userId, stats]) => ({
        userId,
        username: userMap.get(userId)?.username || 'Unknown Player',
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

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error(`User ${id} not found`);
    }
    return result[0];
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
