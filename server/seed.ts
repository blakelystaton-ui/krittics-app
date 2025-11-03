import { db } from "./db";
import { movies, achievements, users, gameSessions } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Seed movies
  const existingMovies = await db.select().from(movies);
  
  if (existingMovies.length === 0) {
    console.log("Seeding movies...");
    await db.insert(movies).values([
      {
        title: "The Grand Adventure of Elias",
        description: "An epic journey through magical lands filled with wonder, danger, and self-discovery.",
        duration: 7200,
        genre: "Fantasy Adventure",
        year: 2024,
        rating: "PG",
        posterUrl: null,
        videoUrl: null,
      },
      {
        title: "Midnight in Tokyo",
        description: "A noir thriller set in the neon-lit streets of modern Japan, where nothing is as it seems.",
        duration: 5400,
        genre: "Thriller",
        year: 2023,
        rating: "R",
        posterUrl: null,
        videoUrl: null,
      },
      {
        title: "The Last Melody",
        description: "A heartwarming story about a retired musician who rediscovers her passion for life through an unexpected friendship.",
        duration: 6000,
        genre: "Drama",
        year: 2024,
        rating: "PG-13",
        posterUrl: null,
        videoUrl: null,
      },
      {
        title: "Quantum Paradox",
        description: "A mind-bending sci-fi adventure about a physicist who discovers parallel universes and must prevent a catastrophic collapse.",
        duration: 6600,
        genre: "Science Fiction",
        year: 2024,
        rating: "PG-13",
        posterUrl: null,
        videoUrl: null,
      },
    ]);
    console.log("✓ Movies seeded");
  }

  // Seed achievements
  const existingAchievements = await db.select().from(achievements);
  
  if (existingAchievements.length === 0) {
    console.log("Seeding achievements...");
    await db.insert(achievements).values([
      {
        name: "First Steps",
        description: "Complete your first trivia game",
        iconUrl: null,
        tier: "bronze",
      },
      {
        name: "Perfect Score",
        description: "Answer all questions correctly in a single game",
        iconUrl: null,
        tier: "gold",
      },
      {
        name: "Movie Buff",
        description: "Play trivia for 10 different movies",
        iconUrl: null,
        tier: "silver",
      },
      {
        name: "Trivia Master",
        description: "Complete 50 trivia games",
        iconUrl: null,
        tier: "platinum",
      },
      {
        name: "Krossfire Champion",
        description: "Win 10 Krossfire matches",
        iconUrl: null,
        tier: "gold",
      },
      {
        name: "Speed Demon",
        description: "Answer 5 questions correctly in under 30 seconds total",
        iconUrl: null,
        tier: "silver",
      },
    ]);
    console.log("✓ Achievements seeded");
  }

  // Create test users if needed (for development)
  const testUsers = [
    {
      id: "test-user-123",
      email: "test@krittics.com",
      username: "TestPlayer",
      displayName: "Test Player",
    },
    {
      id: "user-cinema-fan",
      email: "cinema@krittics.com",
      username: "CinemaFan92",
      displayName: "Cinema Fan",
    },
    {
      id: "user-movie-buff",
      email: "buff@krittics.com",
      username: "MovieBuff",
      displayName: "Movie Buff",
    },
    {
      id: "user-film-geek",
      email: "geek@krittics.com",
      username: "FilmGeek",
      displayName: "Film Geek",
    },
    {
      id: "user-trivia-master",
      email: "master@krittics.com",
      username: "TriviaMaster",
      displayName: "Trivia Master",
    },
  ];

  for (const user of testUsers) {
    const existingUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: user.id,
        firebaseUid: null,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: null,
      });
    }
  }
  console.log("✓ Test users created");

  // Create sample game sessions for leaderboard
  const existingSessions = await db.select().from(gameSessions);
  
  if (existingSessions.length === 0) {
    console.log("Seeding game sessions...");
    const allMovies = await db.select().from(movies);
    
    if (allMovies.length > 0) {
      const sampleSessions = [
        // Krossfire sessions
        { userId: "user-trivia-master", movieId: allMovies[0]?.id, gameMode: "krossfire", score: 450, totalQuestions: 5, status: "completed" as const },
        { userId: "user-trivia-master", movieId: allMovies[1]?.id, gameMode: "krossfire", score: 480, totalQuestions: 5, status: "completed" as const },
        { userId: "user-cinema-fan", movieId: allMovies[2]?.id, gameMode: "krossfire", score: 420, totalQuestions: 5, status: "completed" as const },
        { userId: "user-cinema-fan", movieId: allMovies[0]?.id, gameMode: "krossfire", score: 390, totalQuestions: 5, status: "completed" as const },
        { userId: "user-movie-buff", movieId: allMovies[1]?.id, gameMode: "krossfire", score: 360, totalQuestions: 5, status: "completed" as const },
        { userId: "user-movie-buff", movieId: allMovies[3]?.id, gameMode: "krossfire", score: 330, totalQuestions: 5, status: "completed" as const },
        { userId: "user-film-geek", movieId: allMovies[2]?.id, gameMode: "krossfire", score: 300, totalQuestions: 5, status: "completed" as const },
        { userId: "test-user-123", movieId: allMovies[0]?.id, gameMode: "krossfire", score: 400, totalQuestions: 5, status: "completed" as const },
        { userId: "test-user-123", movieId: allMovies[1]?.id, gameMode: "krossfire", score: 350, totalQuestions: 5, status: "completed" as const },
        
        // Deep Dive sessions
        { userId: "user-trivia-master", movieId: allMovies[0]?.id, gameMode: "deepdive", score: 100, totalQuestions: 5, status: "completed" as const },
        { userId: "user-cinema-fan", movieId: allMovies[1]?.id, gameMode: "deepdive", score: 80, totalQuestions: 5, status: "completed" as const },
        { userId: "user-movie-buff", movieId: allMovies[2]?.id, gameMode: "deepdive", score: 60, totalQuestions: 5, status: "completed" as const },
        { userId: "test-user-123", movieId: allMovies[0]?.id, gameMode: "deepdive", score: 80, totalQuestions: 5, status: "completed" as const },
      ];

      await db.insert(gameSessions).values(sampleSessions);
      console.log("✓ Game sessions seeded");
    }
  }

  console.log("Database seeding complete!");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
