import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateMovieTriviaWithRetry } from "./gemini";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Validation schemas
  const triviaGenerationSchema = z.object({
    movieTitle: z.string().min(1, "Movie title is required"),
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

  // GET /api/movies - Get all available movies
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ error: "Failed to fetch movies" });
    }
  });

  // GET /api/movies/search - Search movies with filters
  app.get("/api/movies/search", async (req, res) => {
    try {
      const { q, genre, year, rating } = req.query;
      
      let movies = await storage.getAllMovies();
      
      // Search by title
      if (q && typeof q === "string") {
        const query = q.toLowerCase();
        movies = movies.filter((movie) =>
          movie.title.toLowerCase().includes(query) ||
          movie.description?.toLowerCase().includes(query)
        );
      }
      
      // Filter by genre
      if (genre && typeof genre === "string") {
        movies = movies.filter((movie) => movie.genre === genre);
      }
      
      // Filter by year
      if (year && typeof year === "string") {
        const yearNum = parseInt(year);
        movies = movies.filter((movie) => movie.year === yearNum);
      }
      
      // Filter by rating
      if (rating && typeof rating === "string") {
        movies = movies.filter((movie) => movie.rating === rating);
      }
      
      res.json(movies);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ error: "Failed to search movies" });
    }
  });

  // GET /api/movies/:id - Get a specific movie
  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movie = await storage.getMovie(req.params.id);
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ error: "Failed to fetch movie" });
    }
  });

  // POST /api/trivia/generate - Generate trivia questions using Gemini AI
  app.post("/api/trivia/generate", async (req, res) => {
    try {
      const validated = triviaGenerationSchema.parse(req.body);

      console.log(`Generating trivia for movie: ${validated.movieTitle}`);

      // Generate trivia using Gemini AI with retry logic
      const questions = await generateMovieTriviaWithRetry(validated.movieTitle);

      console.log(`Successfully generated ${questions.length} trivia questions`);

      res.json({ questions });
    } catch (error) {
      console.error("Error generating trivia:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid request",
          details: error.errors,
        });
      }

      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to generate trivia questions",
      });
    }
  });

  // POST /api/games - Create a new game session
  app.post("/api/games", async (req, res) => {
    try {
      const validated = createGameSchema.parse(req.body);

      const session = await storage.createGameSession({
        userId: validated.userId,
        movieId: validated.movieId || null,
        gameMode: validated.gameMode,
        score: 0,
        totalQuestions: 5,
        status: "playing",
      });

      res.json(session);
    } catch (error) {
      console.error("Error creating game session:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid request",
          details: error.errors,
        });
      }

      res.status(500).json({ error: "Failed to create game session" });
    }
  });

  // GET /api/games/:id - Get game session details
  app.get("/api/games/:id", async (req, res) => {
    try {
      const session = await storage.getGameSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Game session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching game session:", error);
      res.status(500).json({ error: "Failed to fetch game session" });
    }
  });

  // POST /api/games/:id/answer - Submit an answer for a game session
  app.post("/api/games/:id/answer", async (req, res) => {
    try {
      const sessionId = req.params.id;
      const validated = submitAnswerSchema.parse(req.body);

      const session = await storage.getGameSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Game session not found" });
      }

      if (session.status === "completed") {
        return res.status(400).json({ error: "Game session already completed" });
      }

      // For now, we'll just update the score (in real app, would validate against stored questions)
      // This is a simplified version - in production you'd verify the answer against the question

      const updatedSession = await storage.updateGameSession(sessionId, {
        score: session.score + 1, // Increment score (simplified)
      });

      res.json(updatedSession);
    } catch (error) {
      console.error("Error submitting answer:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid request",
          details: error.errors,
        });
      }

      res.status(500).json({ error: "Failed to submit answer" });
    }
  });

  // PATCH /api/games/:id/complete - Mark game as completed
  app.patch("/api/games/:id/complete", async (req, res) => {
    try {
      const sessionId = req.params.id;
      const { score } = req.body;

      const session = await storage.getGameSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Game session not found" });
      }

      const updatedSession = await storage.updateGameSession(sessionId, {
        status: "completed",
        score: score !== undefined ? score : session.score,
        completedAt: new Date(),
      });

      // Calculate result tier
      const percentage = Math.round((updatedSession.score / updatedSession.totalQuestions) * 100);
      let tier: "perfect" | "expert" | "buff" | "novice";

      if (percentage === 100) {
        tier = "perfect";
      } else if (percentage >= 80) {
        tier = "expert";
      } else if (percentage >= 60) {
        tier = "buff";
      } else {
        tier = "novice";
      }

      res.json({
        sessionId: updatedSession.id,
        score: updatedSession.score,
        totalQuestions: updatedSession.totalQuestions,
        percentage,
        tier,
      });
    } catch (error) {
      console.error("Error completing game:", error);
      res.status(500).json({ error: "Failed to complete game" });
    }
  });

  // GET /api/leaderboard/:gameMode - Get leaderboard for a specific game mode
  app.get("/api/leaderboard/:gameMode", async (req, res) => {
    try {
      const { gameMode } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const topPlayers = await storage.getTopPlayersByMode(gameMode, limit);

      res.json(topPlayers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // GET /api/users/:userId/sessions - Get all game sessions for a user
  app.get("/api/users/:userId/sessions", async (req, res) => {
    try {
      const sessions = await storage.getSessionsByUser(req.params.userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ error: "Failed to fetch user sessions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
