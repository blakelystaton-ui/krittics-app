/**
 * triviaRoutes.ts
 * 
 * API routes for trivia generation and game management
 */

import type { Express } from "express";
import { TriviaService } from "../services/TriviaService";
import { GameService } from "../services/GameService";
import type { IStorage } from "../models/IStorage";
import { isAuthenticated } from "../middleware/auth";
import { z } from "zod";

// Validation schemas
const triviaGenerationSchema = z.object({
  movieTitle: z.string().min(1, "Movie title is required"),
  movieId: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  count: z.number().int().min(1).max(10).optional(),
});

const createGameSchema = z.object({
  userId: z.string().min(1),
  movieId: z.string().optional(),
  gameMode: z.enum(["deepdive", "krossfire"]),
});

const submitAnswerSchema = z.object({
  questionIndex: z.number().int().min(0),
  answer: z.string().min(1),
});

export function registerTriviaRoutes(app: Express, storage: IStorage) {
  const triviaService = new TriviaService(storage);
  const gameService = new GameService(storage);

  /**
   * POST /api/trivia/generate
   * Generate fresh trivia questions (no duplicates for user)
   */
  app.post("/api/trivia/generate", isAuthenticated, async (req: any, res) => {
    try {
      console.log("[Trivia API] Step 1: Received request", { body: req.body });
      
      const validated = triviaGenerationSchema.parse(req.body);
      const userId = req.user.claims.sub;

      console.log(`[Trivia API] Step 2: Validated - User ${userId}, Movie: ${validated.movieTitle}, MovieId: ${validated.movieId}`);

      console.log("[Trivia API] Step 3: Calling TriviaService.getFreshQuestions...");
      const questions = await triviaService.getFreshQuestions({
        userId,
        count: validated.count || 5,
        movieId: validated.movieId,
        category: validated.category,
        difficulty: validated.difficulty || 'medium'
      });

      console.log(`[Trivia API] Step 4: Got ${questions.length} questions from service`);
      console.log("[Trivia API] Step 5: Sample question:", questions[0] ? {
        question: questions[0].question.substring(0, 50) + "...",
        optionsCount: questions[0].options?.length,
        hasCorrectAnswer: !!questions[0].correctAnswer
      } : "No questions");

      const response = { questions };
      console.log("[Trivia API] Step 6: Sending response with format { questions: [...] }");
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error("[Trivia API] ERROR:", error);
      console.error("[Trivia API] Error stack:", error.stack);
      if (error instanceof z.ZodError) {
        console.error("[Trivia API] Validation error:", error.errors);
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to generate trivia" });
    }
  });

  /**
   * POST /api/game/create
   * Create a new game session
   */
  app.post("/api/game/create", isAuthenticated, async (req: any, res) => {
    try {
      const validated = createGameSchema.parse(req.body);
      
      const session = await gameService.createGameSession({
        userId: validated.userId,
        movieId: validated.movieId,
        gameMode: validated.gameMode,
        score: 0,
        completed: false,
      });

      res.json(session);
    } catch (error: any) {
      console.error("[Game API] Error creating session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create game session" });
    }
  });

  /**
   * GET /api/game/:id
   * Get a game session by ID
   */
  app.get("/api/game/:id", isAuthenticated, async (req, res) => {
    try {
      const session = await gameService.getGameSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Game session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("[Game API] Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch game session" });
    }
  });

  /**
   * PUT /api/game/:id
   * Update a game session (e.g., final score)
   */
  app.put("/api/game/:id", isAuthenticated, async (req, res) => {
    try {
      const session = await gameService.updateGameSession(req.params.id, req.body);
      res.json(session);
    } catch (error) {
      console.error("[Game API] Error updating session:", error);
      res.status(500).json({ error: "Failed to update game session" });
    }
  });

  /**
   * POST /api/game/:id/answer
   * Submit an answer to a trivia question
   */
  app.post("/api/game/:id/answer", isAuthenticated, async (req: any, res) => {
    try {
      const validated = submitAnswerSchema.parse(req.body);
      
      const answer = await gameService.submitAnswer({
        sessionId: req.params.id,
        questionIndex: validated.questionIndex,
        answer: validated.answer,
        isCorrect: false, // Will be validated server-side
      });

      res.json(answer);
    } catch (error: any) {
      console.error("[Game API] Error submitting answer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to submit answer" });
    }
  });

  /**
   * GET /api/game/:id/answers
   * Get all answers for a session
   */
  app.get("/api/game/:id/answers", isAuthenticated, async (req, res) => {
    try {
      const answers = await gameService.getSessionAnswers(req.params.id);
      res.json(answers);
    } catch (error) {
      console.error("[Game API] Error fetching answers:", error);
      res.status(500).json({ error: "Failed to fetch answers" });
    }
  });
}
