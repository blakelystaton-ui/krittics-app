
// config/gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";
// Imports all necessary functions and the 'db' connection from your other config files
import { saveMovieToFirestore, saveTriviaToFirestore } from "./firebase.js"; 
import { uploadBufferToR2 } from "./r2.js"; 

// 1. Initialize the Gemini Client
// Assumes GEMINI_API_KEY is stored securely in Replit Secrets
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Define the Movie Data Schema (Metadata Extraction)
const MOVIE_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "The official, clean title of the movie.",
    },
    synopsis: {
      type: "string",
      description: "A brief, 3-sentence plot summary suitable for a listing page.",
    },
    releaseYear: {
      type: "integer",
      description: "The four-digit release year (e.g., 2024).",
    },
    categories: {
      type: "array",
      description: "A list of relevant genres/tags (e.g., Action, Sci-Fi). Max 5 items.",
      items: { type: "string" },
    },
    cast: {
      type: "array",
      description: "A list of the four most prominent actors/actresses.",
      items: { type: "string" },
    },
  },
  required: ["title", "synopsis", "releaseYear", "categories"],
};

// 3. Define the Trivia Data Schema (Trivia Generation)
const TRIVIA_SCHEMA = {
  type: "object",
  properties: {
    movieTitle: {
      type: "string",
      description: "The title of the movie the trivia is based on.",
    },
    questions: {
      type: "array",
      description: "A list of 5 challenging multiple-choice questions about the movie, each with 4 options.",
      items: {
        type: "object",
        properties: {
          questionText: {
            type: "string",
            description: "The full text of the trivia question.",
          },
          options: {
            type: "array",
            description: "Exactly 4 unique, plausible multiple-choice options, including the correct one.",
            items: { type: "string" },
            minItems: 4,
            maxItems: 4,
          },
          correctIndex: {
            type: "integer",
            description: "The index (0, 1, 2, or 3) within the 'options' array that corresponds to the correct answer.",
          },
        },
        required: ["questionText", "options", "correctIndex"],
      },
    },
  },
  required: ["movieTitle", "questions"],
};


/**
 * ----------------------------------------------------------------------
 * POSTER GENERATION AND UPLOAD (Step 7)
 * ----------------------------------------------------------------------
 */
export async function generatePosterAndUpload(movieTitle, synopsis, movieId) {
    const posterPrompt = `
        Create a dramatic, high-contrast, vertical movie poster (9:16 aspect ratio) for the film: "${movieTitle}". 
        The poster should visually represent the core plot: "${synopsis}". 
        Focus on cinematic quality, legible typography for the title, and a style suitable for an independent streaming service.
    `;

    try {
        console.log(`[Gemini] Generating poster for: ${movieTitle}`);
        const response = await genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash-image",
        }).generateContent({
            contents: [{ role: "user", parts: [{ text: posterPrompt }] }],
            config: {
                aspectRatio: "9