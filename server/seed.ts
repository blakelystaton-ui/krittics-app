import { db } from "./db";
import { movies, achievements, users } from "@shared/schema";
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

  // Create a test user if needed (for development)
  const testUserId = "test-user-123";
  const existingUser = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
  
  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: testUserId,
      firebaseUid: null,
      email: "test@krittics.com",
      displayName: "Test User",
      avatarUrl: null,
    });
    console.log("✓ Test user created");
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
