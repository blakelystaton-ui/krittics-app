import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  interests: text("interests").array(),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Movies table
export const movies = pgTable("movies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  tagline: text("tagline"),
  director: text("director"),
  cast: text("cast").array(),
  duration: integer("duration").notNull(), // in seconds
  genre: text("genre"),
  year: integer("year"),
  rating: text("rating"), // PG, PG-13, R, etc.
  posterUrl: text("poster_url"),
  videoUrl: text("video_url"),
  studio: text("studio"),
  country: text("country"),
  language: text("language"),
  awards: text("awards").array(),
});

// Trivia questions table
export const triviaQuestions = pgTable("trivia_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  movieId: varchar("movie_id").references(() => movies.id),
  question: text("question").notNull(),
  options: json("options").$type<string[]>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Game sessions table
export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  movieId: varchar("movie_id").references(() => movies.id),
  score: integer("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(5),
  gameMode: text("game_mode").notNull(), // 'deepdive' or 'krossfire'
  status: text("status").notNull().default('playing'), // 'playing', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Answers table
export const answers = pgTable("answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => gameSessions.id),
  questionId: varchar("question_id").references(() => triviaQuestions.id),
  userAnswer: text("user_answer").notNull(),
  isCorrect: integer("is_correct").notNull(), // 0 or 1 (boolean)
  answeredAt: timestamp("answered_at").defaultNow(),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  tier: text("tier"), // bronze, silver, gold, platinum
});

// User achievements table (junction table)
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  achievementId: varchar("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Leaderboard entries table
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameMode: text("game_mode").notNull(), // 'deepdive' or 'krossfire'
  totalScore: integer("total_score").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  winRate: integer("win_rate").notNull().default(0), // percentage
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Video progress table (for resume functionality)
export const videoProgress = pgTable("video_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  movieId: varchar("movie_id").references(() => movies.id).notNull(),
  progressSeconds: integer("progress_seconds").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Watchlist table (user's saved movies/queue)
export const watchlist = pgTable("watchlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  movieId: varchar("movie_id").references(() => movies.id).notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// Friendships table
export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  friendId: varchar("friend_id").references(() => users.id).notNull(),
  status: text("status").notNull().default('accepted'), // 'pending', 'accepted', 'blocked'
  createdAt: timestamp("created_at").defaultNow(),
});

// Friend interactions table (tracks how often users interact)
export const friendInteractions = pgTable("friend_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  friendId: varchar("friend_id").references(() => users.id).notNull(),
  interactionType: text("interaction_type").notNull(), // 'room_join', 'message', 'game_played'
  interactionCount: integer("interaction_count").notNull().default(1),
  lastInteractionAt: timestamp("last_interaction_at").defaultNow(),
});

// Movie reactions table (user likes/dislikes)
export const movieReactions = pgTable("movie_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  movieId: varchar("movie_id").references(() => movies.id).notNull(),
  reaction: text("reaction").notNull(), // 'like' or 'dislike'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Player requests table (for play/watch invitations)
export const playerRequests = pgTable("player_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  requestType: text("request_type").notNull(), // 'play' or 'watch'
  status: text("status").notNull().default('pending'), // 'pending', 'accepted', 'rejected', 'expired'
  roomCode: varchar("room_code"),
  roomStrategy: text("room_strategy").notNull().default('generate-on-accept'), // 'existing' or 'generate-on-accept'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
});

export const insertTriviaQuestionSchema = createInsertSchema(triviaQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
  answeredAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  updatedAt: true,
});

export const insertVideoProgressSchema = createInsertSchema(videoProgress).omit({
  id: true,
  updatedAt: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  addedAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
});

export const insertFriendInteractionSchema = createInsertSchema(friendInteractions).omit({
  id: true,
  lastInteractionAt: true,
});

export const insertPlayerRequestSchema = createInsertSchema(playerRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMovieReactionSchema = createInsertSchema(movieReactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Select types
export type User = typeof users.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type TriviaQuestion = typeof triviaQuestions.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type VideoProgress = typeof videoProgress.$inferSelect;
export type Watchlist = typeof watchlist.$inferSelect;
export type Friendship = typeof friendships.$inferSelect;
export type FriendInteraction = typeof friendInteractions.$inferSelect;
export type MovieReaction = typeof movieReactions.$inferSelect;
export type PlayerRequest = typeof playerRequests.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type InsertTriviaQuestion = z.infer<typeof insertTriviaQuestionSchema>;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type InsertVideoProgress = z.infer<typeof insertVideoProgressSchema>;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type InsertFriendInteraction = z.infer<typeof insertFriendInteractionSchema>;
export type InsertMovieReaction = z.infer<typeof insertMovieReactionSchema>;
export type InsertPlayerRequest = z.infer<typeof insertPlayerRequestSchema>;

// API response types
export interface TriviaGenerationRequest {
  movieTitle: string;
}

export interface GeneratedTriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface TriviaGenerationResponse {
  questions: GeneratedTriviaQuestion[];
}

export interface AnswerSubmission {
  questionIndex: number;
  answer: string;
  isCorrect: boolean;
}

export interface GameResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  tier: 'perfect' | 'expert' | 'buff' | 'novice';
}
