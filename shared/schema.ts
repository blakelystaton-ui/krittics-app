import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Movies table
export const movies = pgTable("movies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in seconds
  posterUrl: text("poster_url"),
  videoUrl: text("video_url"),
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
  userId: text("user_id").notNull(),
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

// Insert schemas
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

// Select types
export type Movie = typeof movies.$inferSelect;
export type TriviaQuestion = typeof triviaQuestions.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type Answer = typeof answers.$inferSelect;

// Insert types
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type InsertTriviaQuestion = z.infer<typeof insertTriviaQuestionSchema>;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

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
