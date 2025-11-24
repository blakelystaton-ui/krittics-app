/**
 * IStorage.ts
 * 
 * Storage interface defining all database operations
 * Implemented by DatabaseStorage (PostgreSQL) and MemStorage (in-memory)
 */

import type {
  Movie,
  InsertMovie,
  GameSession,
  InsertGameSession,
  TriviaQuestion,
  InsertTriviaQuestion,
  Answer,
  InsertAnswer,
  User,
  UpsertUser,
  Friendship,
  MatchmakingQueue,
  InsertMatchmakingQueue,
} from "@shared/schema";

export interface IStorage {
  // ============================================
  // User Operations
  // ============================================
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // ============================================
  // Movies
  // ============================================
  getMovie(id: string): Promise<Movie | undefined>;
  getAllMovies(): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;

  // ============================================
  // Game Sessions
  // ============================================
  getGameSession(id: string): Promise<GameSession | undefined>;
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession>;
  getSessionsByUser(userId: string): Promise<GameSession[]>;

  // ============================================
  // Trivia Questions (Question Pool System)
  // ============================================
  getTriviaQuestion(id: string): Promise<TriviaQuestion | undefined>;
  getQuestionsByMovie(movieId: string): Promise<TriviaQuestion[]>;
  createTriviaQuestion(question: InsertTriviaQuestion): Promise<TriviaQuestion>;
  upsertTriviaQuestion(question: InsertTriviaQuestion): Promise<TriviaQuestion>;
  createManyTriviaQuestions(questions: InsertTriviaQuestion[]): Promise<TriviaQuestion[]>;
  getTriviaQuestionsByFilter(filter: { movieId?: string; category?: string; difficulty?: string }): Promise<TriviaQuestion[]>;
  getTriviaQuestionByHash(hash: string): Promise<TriviaQuestion | undefined>;
  
  // User seen questions (no-duplicate system)
  getUserSeenQuestions(userId: string): Promise<string[]>;
  getUserSeenQuestionsForMovie(userId: string, movieId: string): Promise<string[]>;
  markQuestionsAsSeen(userId: string, questionIds: string[]): Promise<void>;
  clearUserSeenQuestions(userId: string, movieId?: string, category?: string): Promise<void>;
  reserveQuestionsForUser(userId: string, movieId: string, count: number, category?: string, difficulty?: string): Promise<TriviaQuestion[]>;
  
  // Trivia cache (30-day TTL for Gemini responses)
  getCachedTrivia(movieTitle: string): Promise<{ questions: any[]; generatedAt: Date } | undefined>;
  setCachedTrivia(movieTitle: string, questions: any[]): Promise<void>;

  // ============================================
  // Answers
  // ============================================
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  getAnswersBySession(sessionId: string): Promise<Answer[]>;

  // ============================================
  // Leaderboard
  // ============================================
  getTopPlayersByMode(
    gameMode: string, 
    limit?: number, 
    period?: 'daily' | 'weekly' | 'all-time'
  ): Promise<{ 
    userId: string; 
    username: string; 
    totalScore: number; 
    gamesPlayed: number; 
    averageScore: number;
  }[]>;

  // ============================================
  // Friends
  // ============================================
  getFriendsByUser(userId: string): Promise<(User & { interactionCount: number; lastInteractionAt: Date | null })[]>;
  searchUsers(query: string, excludeUserId?: string): Promise<User[]>;
  addFriend(userId: string, friendId: string): Promise<Friendship>;
  trackInteraction(userId: string, friendId: string, interactionType: string): Promise<void>;

  // ============================================
  // Watchlist
  // ============================================
  addToWatchlist(userId: string, movieId: string): Promise<void>;
  removeFromWatchlist(userId: string, movieId: string): Promise<void>;
  getWatchlistByUser(userId: string): Promise<Movie[]>;
  isInWatchlist(userId: string, movieId: string): Promise<boolean>;

  // ============================================
  // User Interests (Crew Matching)
  // ============================================
  updateUserInterests(userId: string, interests: string[]): Promise<User>;
  getUserInterests(userId: string): Promise<string[]>;
  findCrewByInterests(userId: string): Promise<(User & { sharedInterests: string[] })[]>;

  // ============================================
  // Video Progress (Continue Watching)
  // ============================================
  updateVideoProgress(userId: string, movieId: string, progressSeconds: number, completed: boolean): Promise<any>;
  getVideoProgress(userId: string, movieId: string): Promise<any>;
  getContinueWatching(userId: string): Promise<(Movie & { progressSeconds: number; progressPercentage: number })[]>;

  // ============================================
  // Matchmaking Queue (Quick Match)
  // ============================================
  createQueueEntry(entry: InsertMatchmakingQueue): Promise<MatchmakingQueue>;
  getActiveQueueEntry(userId: string): Promise<MatchmakingQueue | undefined>;
  getWaitingPlayers(excludeUserId: string): Promise<MatchmakingQueue[]>;
  updateQueueEntry(entryId: string, updates: Partial<MatchmakingQueue>): Promise<MatchmakingQueue>;
  deleteExpiredQueueEntries(): Promise<number>;
}
