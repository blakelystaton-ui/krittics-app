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
 * Implements the question pool logic with seen question tracking
 */
export async function getFreshQuestions(params: FreshQuestionsParams) {
  const {
    userId,
    count = 5,
    movieId,
    category,
    difficulty = 'medium'
  } = params;

  try {
    // Step 1: Get all questions matching criteria
    const allQuestions = await storage.getTriviaQuestionsByFilter({
      movieId,
      category,
      difficulty
    });

    // Step 2: Get questions the user has already seen
    const seenQuestionIds = await storage.getUserSeenQuestions(userId);

    // Step 3: Filter out seen questions
    let availableQuestions = allQuestions.filter(
      (q: any) => !seenQuestionIds.includes(q.id)
    );

    // Step 4: If not enough unseen questions, reset the user's history
    if (availableQuestions.length < count) {
      console.log(`User ${userId} has seen most questions, resetting history`);
      await storage.clearUserSeenQuestions(userId, movieId, category);
      
      // Refetch questions after reset to update availableQuestions
      const refreshedSeenIds = await storage.getUserSeenQuestions(userId);
      availableQuestions = allQuestions.filter(
        (q: any) => !refreshedSeenIds.includes(q.id)
      );
    }

    // Step 5: If still not enough questions, generate new ones
    if (availableQuestions.length < count) {
      if (!movieId) {
        throw new Error(`Not enough trivia questions available. Please provide a movieId to generate fresh questions.`);
      }
      
      console.log(`Not enough questions in pool, generating fresh ones`);
      const movie = await storage.getMovie(movieId);
      if (!movie) {
        throw new Error(`Movie ${movieId} not found`);
      }
      
      // Get current seen questions to avoid duplicates
      const currentSeenIds = await storage.getUserSeenQuestions(userId);
      
      const freshQuestions = await generateAndStoreQuestions(
        movie.title,
        movieId,
        userId,
        currentSeenIds,
        category,
        difficulty
      );
      availableQuestions.push(...freshQuestions);
      
      // Still not enough after generation?
      if (availableQuestions.length < count) {
        throw new Error(`Unable to generate ${count} questions. Only ${availableQuestions.length} available.`);
      }
    }

    // Step 6: Randomly select questions
    const selectedQuestions = shuffleArray(availableQuestions).slice(0, count);

    // Step 7: Mark these questions as seen
    await storage.markQuestionsAsSeen(
      userId,
      selectedQuestions.map((q: any) => q.id)
    );

    return selectedQuestions;
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
