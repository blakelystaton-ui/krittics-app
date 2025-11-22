import { storage } from "./storage";
import { generateMovieTriviaWithRetry } from "./gemini";
import crypto from "crypto";

export interface FreshQuestionsParams {
  userId: string;
  count?: number;
  movieId?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Generate a SHA-256 hash from question content for deduplication
 */
function generateQuestionHash(question: string, options: string[]): string {
  const content = question + options.join('|');
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Get fresh trivia questions that the user hasn't seen before
 * Uses transactional row-locking to prevent concurrent requests from getting duplicates
 */
export async function getFreshQuestions(params: FreshQuestionsParams) {
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
    // Try to reserve questions atomically using database-level locking
    let reservedQuestions = await storage.reserveQuestionsForUser(
      userId,
      movieId,
      count,
      category,
      difficulty
    );

    // If not enough questions were reserved, we need to generate more
    if (reservedQuestions.length < count) {
      console.log(`Only ${reservedQuestions.length} questions available, need ${count}. Checking if reset or generation needed.`);
      
      // Get total available questions in the pool
      const allQuestions = await storage.getTriviaQuestionsByFilter({
        movieId,
        category,
        difficulty
      });

      // If pool is exhausted (80%+ seen for THIS MOVIE), reset user history
      const movieSeenIds = await storage.getUserSeenQuestionsForMovie(userId, movieId);
      const seenPercentage = allQuestions.length > 0 ? (movieSeenIds.length / allQuestions.length) : 0;
      
      if (seenPercentage >= 0.8 && allQuestions.length > 0) {
        console.log(`User ${userId} has seen ${seenPercentage * 100}% of questions, resetting history`);
        await storage.clearUserSeenQuestions(userId, movieId, category);
        
        // Retry reservation after reset
        reservedQuestions = await storage.reserveQuestionsForUser(
          userId,
          movieId,
          count,
          category,
          difficulty
        );
      }
      
      // If still not enough, generate fresh questions
      if (reservedQuestions.length < count) {
        console.log(`Generating new questions to satisfy request`);
        const movie = await storage.getMovie(movieId);
        if (!movie) {
          throw new Error(`Movie ${movieId} not found`);
        }
        
        // Get current seen IDs to avoid regenerating duplicates
        const currentSeenIds = await storage.getUserSeenQuestions(userId);
        
        // Generate new questions
        const freshQuestions = await generateAndStoreQuestions(
          movie.title,
          movieId,
          userId,
          currentSeenIds,
          category,
          difficulty
        );
        
        // If generation succeeded, retry reservation
        if (freshQuestions.length > 0) {
          reservedQuestions = await storage.reserveQuestionsForUser(
            userId,
            movieId,
            count,
            category,
            difficulty
          );
        }
        
        // Final check - if still not enough, throw error
        if (reservedQuestions.length < count) {
          throw new Error(`Unable to generate ${count} questions. Only ${reservedQuestions.length} available.`);
        }
      }
    }

    console.log(`Successfully reserved ${reservedQuestions.length} fresh trivia questions atomically`);
    return reservedQuestions;
  } catch (error) {
    console.error('Error getting fresh questions:', error);
    throw error;
  }
}

/**
 * Generate new questions using Gemini AI and store them in the database
 * IMPORTANT: Only returns questions that haven't been seen by the user
 */
async function generateAndStoreQuestions(
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
    const questionHash = generateQuestionHash(q.question, q.options);

    // Upsert question (handles concurrent inserts safely)
    const stored = await storage.upsertTriviaQuestion({
      movieId,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty,
      category,
      questionHash
    });

    // Only add if user hasn't seen this question yet
    if (!seenQuestionIds.includes(stored.id)) {
      storedQuestions.push(stored);
    }
  }

  return storedQuestions;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Pre-populate trivia pool with questions for popular categories
 * Can be called on server startup or via admin endpoint
 * NOTE: This is for initial pool population only, doesn't filter by user
 */
export async function populateTriviaPool() {
  const movies = await storage.getAllMovies();
  const categories = ['sci-fi', 'comedy', 'drama', 'action'];
  
  for (const movie of movies) {
    const category = movie.genre?.toLowerCase();
    if (category && categories.includes(category)) {
      console.log(`Populating trivia pool for ${movie.title} (${category})`);
      
      try {
        const generated = await generateMovieTriviaWithRetry(movie.title);

        for (const q of generated) {
          const questionHash = generateQuestionHash(q.question, q.options);
          
          // Use upsert to handle concurrent inserts safely
          await storage.upsertTriviaQuestion({
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
        console.error(`Failed to generate questions for ${movie.title}:`, error);
      }
    }
  }
}
