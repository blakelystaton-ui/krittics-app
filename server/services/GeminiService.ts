/**
 * GeminiService.ts
 * 
 * Wrapper for Google Gemini 2.0 Flash AI integration via Replit AI Integrations
 * Handles trivia question generation with retry logic and structured JSON output parsing
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with Replit AI Integrations key (automatically provided)
const genAI = new GoogleGenerativeAI(process.env.AI_INTEGRATIONS_GOOGLE_AI_API_KEY || "");

interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

/**
 * Generate movie trivia questions using Gemini 2.5 Flash
 * Returns structured JSON output with retry logic for reliability
 */
export async function generateMovieTriviaWithRetry(
  movieTitle: string,
  maxRetries = 3
): Promise<TriviaQuestion[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `Generate 5 trivia questions about the movie "${movieTitle}". 
Each question should be interesting and test knowledge about the movie's plot, characters, themes, or production.

Return your response as a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The correct option text"
  }
]

Requirements:
- Each question must have exactly 4 options
- The correctAnswer must match one of the options exactly
- Questions should be varied (plot, characters, themes, production, etc.)
- Difficulty: medium (not too easy, not impossibly hard)
- Return ONLY the JSON array, no additional text`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Gemini] Attempt ${attempt}/${maxRetries} for "${movieTitle}"`);
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const questions = JSON.parse(cleanedText);

      // Validate structure
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      for (const q of questions) {
        if (!q.question || !Array.isArray(q.options) || !q.correctAnswer) {
          throw new Error('Invalid question structure');
        }
        if (q.options.length !== 4) {
          throw new Error('Each question must have exactly 4 options');
        }
        if (!q.options.includes(q.correctAnswer)) {
          throw new Error('correctAnswer must be one of the options');
        }
      }

      console.log(`[Gemini] Successfully generated ${questions.length} questions`);
      return questions;

    } catch (error) {
      lastError = error as Error;
      console.error(`[Gemini] Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Exponential backoff
        console.log(`[Gemini] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Failed to generate trivia after ${maxRetries} attempts: ${lastError?.message}`);
}
