import { Injectable } from '@angular/core';

// Define the structured type for the trivia output
export interface TriviaQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  payout_value: number;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private apiKey = ''; // Leave as empty string for Replit environment
  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${this.apiKey}`;

  constructor() {}

  /**
   * Generates a trivia question related to a movie/content and requests a structured JSON response.
   * @param movieTitle The title of the movie the user is watching (e.g., 'Tears of Steel').
   * @returns A promise that resolves to a TriviaQuestion object.
   */
  async generateTrivia(movieTitle: string): Promise<TriviaQuestion> {
    const userPrompt = `Generate one challenging trivia question about the movie "${movieTitle}". Provide the question, four answer options, the single correct answer, and a suggested monetary payout value (in USD, between 0.01 and 0.05).`;

    // Define the JSON schema for structured output
    const responseSchema = {
      type: 'OBJECT',
      properties: {
        question: { type: 'STRING', description: 'The trivia question.' },
        options: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description:
            'Exactly four answer options, including the correct one.',
        },
        correct_answer: {
          type: 'STRING',
          description: 'The exact text of the correct answer option.',
        },
        payout_value: {
          type: 'NUMBER',
          description:
            'The monetary value in USD earned for a correct answer (between 0.01 and 0.05).',
        },
      },
      propertyOrdering: [
        'question',
        'options',
        'correct_answer',
        'payout_value',
      ],
      required: ['question', 'options', 'correct_answer', 'payout_value'],
    };

    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (jsonText) {
        return JSON.parse(jsonText) as TriviaQuestion;
      } else {
        throw new Error('Gemini response was missing text content.');
      }
    } catch (error) {
      console.error('Gemini Trivia Generation Error:', error);
      // Return a safe fallback question
      return {
        question: 'Fallback: What year was Krittics founded?',
        options: ['2023', '2024', '2025', '2026'],
        correct_answer: '2025',
        payout_value: 0.01,
      };
    }
  }
}
