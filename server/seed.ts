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
        title: "Big Buck Bunny",
        description: "A giant rabbit with a heart bigger than himself, Big Buck Bunny is harassed by a trio of rodents. In a fit of rage, he decides to teach them a lesson.",
        duration: 596,
        genre: "Comedy",
        year: 2008,
        rating: "G",
        posterUrl: "/posters/big-buck-bunny.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      },
      {
        title: "Sintel",
        description: "A lonely girl searches for her only friend, a baby dragon, in this epic fantasy adventure filled with danger, sacrifice, and unexpected revelations.",
        duration: 888,
        genre: "Fantasy",
        year: 2010,
        rating: "PG",
        posterUrl: "/posters/sintel.jpg",
        videoUrl: "https://download.blender.org/demo/movies/BBB/bbb_sunflower_1080p_30fps_normal.mp4",
      },
      {
        title: "Tears of Steel",
        description: "In a post-apocalyptic future, a group of scientists and warriors fight to preserve the last remnants of humanity using advanced robotics.",
        duration: 734,
        genre: "Science Fiction",
        year: 2012,
        rating: "PG-13",
        posterUrl: "/posters/tears-of-steel.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      },
      {
        title: "Elephants Dream",
        description: "Two strange characters explore an enigmatic mechanical world in this surrealist masterpiece that challenges perception and reality.",
        duration: 654,
        genre: "Surreal",
        year: 2006,
        rating: "PG",
        posterUrl: "/posters/elephants-dream.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      },
      {
        title: "Spring",
        description: "A shepherd encounters a mysterious woman in a remote Italian village, leading to an unexpected romance that transforms both their lives.",
        duration: 456,
        genre: "Romance",
        year: 2019,
        rating: "PG",
        posterUrl: "/posters/spring.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      },
      {
        title: "Cosmos Laundromat",
        description: "A depressed sheep named Franck is offered a chance to change his life by a mysterious salesman in this philosophical dark comedy.",
        duration: 720,
        genre: "Dark Comedy",
        year: 2015,
        rating: "PG-13",
        posterUrl: "/posters/cosmos-laundromat.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      },
      {
        title: "Agent 327: Operation Barbershop",
        description: "The suave spy Agent 327 investigates a barbershop suspected of being a front for nefarious activities in this action-packed espionage adventure.",
        duration: 232,
        genre: "Action",
        year: 2017,
        rating: "PG",
        posterUrl: "/posters/agent-327.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      },
      {
        title: "Caminandes: Llama Drama",
        description: "A llama struggles to reach a delicious fruit on the other side of a dangerous chasm in the Patagonian landscape.",
        duration: 90,
        genre: "Comedy",
        year: 2013,
        rating: "G",
        posterUrl: "/posters/caminandes-1.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      },
      {
        title: "Caminandes: Gran Dillama",
        description: "The llama faces a new predicament when he discovers food on the other side of a different obstacle in the frozen Andes.",
        duration: 150,
        genre: "Comedy",
        year: 2013,
        rating: "G",
        posterUrl: "/posters/caminandes-2.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      },
      {
        title: "Caminandes: Llamigos",
        description: "In the final chapter, our llama friend discovers that sometimes the best treasures are the friendships we make along the way.",
        duration: 150,
        genre: "Comedy",
        year: 2016,
        rating: "G",
        posterUrl: "/posters/caminandes-3.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Chromecast.mp4",
      },
      {
        title: "Coffee Run",
        description: "In a futuristic city, a desperate courier must deliver coffee through a dangerous urban landscape. Every second counts.",
        duration: 360,
        genre: "Action",
        year: 2020,
        rating: "PG-13",
        posterUrl: "/posters/coffee-run.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      },
      {
        title: "Sprite Fright",
        description: "A group of teens camping in the woods encounter magical sprites with a dark side in this horror-comedy that will keep you on edge.",
        duration: 641,
        genre: "Horror",
        year: 2021,
        rating: "PG-13",
        posterUrl: "/posters/sprite-fright.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      },
      {
        title: "Glass Half",
        description: "Two bartenders, one optimist and one pessimist, debate life's meaning through their interactions with customers in this contemplative drama.",
        duration: 186,
        genre: "Drama",
        year: 2015,
        rating: "PG",
        posterUrl: "/posters/glass-half.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
      },
      {
        title: "Hero",
        description: "A tiny creature discovers he has the power to save his world from destruction, but first he must believe in himself.",
        duration: 216,
        genre: "Adventure",
        year: 2021,
        rating: "G",
        posterUrl: "/posters/hero.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
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
