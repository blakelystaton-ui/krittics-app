# Server Architecture Documentation

This document describes the backend architecture for Krittics, including module organization, design patterns, and implementation details.

## Architecture Overview

The server follows a **modular, service-oriented architecture** with clear separation of concerns:

```
server/
├── config/              # Configuration & external service initialization
├── middleware/          # Express middleware (auth, logging, etc.)
├── models/              # TypeScript interfaces & type definitions
├── routes/              # API route handlers (thin controllers)
├── services/            # Business logic layer (core application logic)
├── utils/               # Shared utility functions
├── storage.ts           # Database implementation (IStorage interface)
├── seed.ts             # Database seeding script
└── index.ts            # Server entry point
```

### Design Principles

1. **Separation of Concerns**: Routes handle HTTP, services contain business logic, storage manages data
2. **Dependency Injection**: Services receive storage interface, making them testable
3. **Interface-Driven**: `IStorage` interface ensures storage implementation can be swapped
4. **Service Layer Pattern**: All business logic lives in dedicated service classes
5. **Thin Controllers**: Route handlers delegate to services, minimal logic in routes

## Module Breakdown

### config/

**Purpose**: Configuration files and external service initialization

- **db.ts**: PostgreSQL connection via Neon HTTP driver (Drizzle ORM)
  - Uses `neon-http` for Replit compatibility (no transaction support)
  - Exports configured `db` instance with schema
  
- **gemini.ts**: Google Gemini 2.0 Flash AI client setup
  - Initializes `GoogleGenAI` with Replit AI Integrations API key
  - Provides trivia generation with retry logic and structured JSON output
  - Uses `responseMimeType: "application/json"` and `responseSchema` for type safety

### middleware/

**Purpose**: Express middleware for cross-cutting concerns

- **auth.ts**: Replit Auth (OIDC) integration
  - Based on `blueprint:javascript_log_in_with_replit`
  - Multi-domain support with dynamic strategy registration
  - PostgreSQL session storage via `connect-pg-simple`
  - Exports `setupAuth(app)` function and `isAuthenticated` middleware
  - Routes: `/api/login`, `/api/callback`, `/api/logout`

### models/

**Purpose**: TypeScript interfaces and type definitions

- **IStorage.ts**: Storage interface contract
  - Defines all database operations (users, movies, trivia, games, friends, etc.)
  - Ensures storage implementation is swappable (PostgreSQL ↔ in-memory)
  - Serves as documentation for all available database operations

### routes/

**Purpose**: API endpoint definitions (thin controllers)

Each route module follows the pattern:
```typescript
export function registerXxxRoutes(app: Express, storage: IStorage) {
  app.get('/api/xxx', async (req, res) => {
    // 1. Extract/validate request data
    // 2. Call service layer
    // 3. Return response
  });
}
```

**Modules**:
- **index.ts**: Consolidated router that registers all route modules
- **movieRoutes.ts**: Movie catalog endpoints (`GET /api/movies`, `GET /api/movies/:id`)
- **triviaRoutes.ts**: Trivia generation and game management
  - `GET /api/trivia/fresh?userId=X&movieId=Y&count=5` - Get fresh questions
  - `POST /api/trivia/games` - Create game session
  - `PATCH /api/trivia/games/:id` - Update game session
  - `POST /api/trivia/games/:sessionId/answers` - Submit answer
- **userRoutes.ts**: User and friend management
  - `GET /api/users/search?q=john` - Search users
  - `POST /api/users/friends` - Add friend
  - `GET /api/users/friends` - Get friends list
  - `GET /api/users/crew-match` - Find users by shared interests
- **watchlistRoutes.ts**: Queue/watchlist management
  - `GET /api/watchlist` - Get watchlist
  - `POST /api/watchlist` - Add to watchlist
  - `DELETE /api/watchlist/:movieId` - Remove from watchlist
- **videoProgressRoutes.ts**: Video progress tracking
  - `POST /api/video-progress` - Update progress
  - `GET /api/video-progress/:movieId` - Get progress
  - `GET /api/video-progress/continue-watching` - Continue watching list
- **leaderboardRoutes.ts**: Leaderboard queries
  - `GET /api/leaderboard?mode=deep-dive&period=all-time` - Get rankings

### services/

**Purpose**: Business logic layer (core application logic)

Each service encapsulates domain-specific logic and is injected with `IStorage`:

- **GeminiService.ts**: AI trivia generation wrapper
  - `generateMovieTriviaWithRetry(movieTitle, maxRetries=3)` - Retry logic with exponential backoff
  - Structured JSON output with schema validation
  - Error handling for AI failures

- **TriviaService.ts**: Trivia pool management system
  - `getFreshQuestions(params)` - Get unique questions for user
  - SHA-256 hash deduplication (`generateSHA256Hash()`)
  - Per-movie question isolation
  - Auto-reset at 80%+ seen threshold
  - Handles concurrent requests with "Mark as Seen Immediately" approach

- **GameService.ts**: Game session management
  - `createGameSession(params)` - Initialize new game
  - `updateGameSession(id, updates)` - Update score/status
  - `submitAnswer(params)` - Record answer and calculate correctness

- **MovieService.ts**: Movie catalog operations
  - `getMovieById(id)` - Fetch single movie
  - `getAllMovies()` - Get full catalog
  - Movie metadata management

- **UserService.ts**: User profile and friend operations
  - `searchUsers(query, excludeUserId)` - Friend search
  - `addFriend(userId, friendId)` - Create friendship
  - `getFriends(userId)` - Get friends with interaction counts
  - `trackInteraction(userId, friendId, type)` - Record interactions
  - `findCrewByInterests(userId)` - Matchmaking by shared interests

- **WatchlistService.ts**: Watchlist/queue management
  - `getWatchlist(userId)` - Get user's queue
  - `addToWatchlist(userId, movieId)` - Add movie
  - `removeFromWatchlist(userId, movieId)` - Remove movie
  - `isInWatchlist(userId, movieId)` - Check membership

- **VideoProgressService.ts**: Video progress tracking
  - `updateProgress(userId, movieId, progressSeconds, completed)` - Save progress
  - `getProgress(userId, movieId)` - Retrieve progress
  - `getContinueWatching(userId)` - Get in-progress movies

### utils/

**Purpose**: Shared utility functions

- **crypto.ts**: Cryptographic operations
  - `generateSHA256Hash(content)` - SHA-256 hashing for deduplication
  - `generateUUID()` - UUID generation

### Root Files

- **storage.ts**: PostgreSQL implementation of `IStorage` interface
  - Uses Drizzle ORM for all database operations
  - Implements all methods defined in `IStorage`
  - Exports singleton `storage` instance

- **seed.ts**: Database seeding script
  - Seeds 4 Blender Foundation movies with full metadata
  - Run via `npm run seed`

- **index.ts**: Server entry point
  - Initializes Express app
  - Configures middleware (body parsing, session, auth)
  - Registers all routes via `registerRoutes(app)`
  - Sets up Vite dev server (development) or static serving (production)
  - Starts HTTP server on port 5000

## Request Flow

### Example: Get Fresh Trivia Questions

1. **Client Request**: `GET /api/trivia/fresh?userId=123&movieId=456&count=5`

2. **Route Handler** (`triviaRoutes.ts`):
   ```typescript
   app.get('/api/trivia/fresh', async (req, res) => {
     const { userId, movieId, count } = req.query;
     const questions = await TriviaService.getFreshQuestions(storage, { userId, movieId, count });
     res.json(questions);
   });
   ```

3. **Service Layer** (`TriviaService.ts`):
   ```typescript
   async getFreshQuestions(storage: IStorage, params: FreshQuestionsParams) {
     // 1. Get questions user hasn't seen
     const seenIds = await storage.getUserSeenQuestionsForMovie(userId, movieId);
     let questions = await storage.getTriviaQuestionsByFilter({ movieId, excludeIds: seenIds });
     
     // 2. If insufficient, generate new ones via Gemini
     if (questions.length < count) {
       const movie = await storage.getMovie(movieId);
       const newQuestions = await GeminiService.generateMovieTriviaWithRetry(movie.title);
       questions = [...questions, ...newQuestions];
     }
     
     // 3. Mark as seen immediately (prevent duplicates)
     await storage.markQuestionsAsSeen(userId, questions.map(q => q.id));
     
     return questions;
   }
   ```

4. **Storage Layer** (`storage.ts`):
   ```typescript
   async getUserSeenQuestionsForMovie(userId: string, movieId: string): Promise<string[]> {
     const results = await db
       .select({ questionId: userSeenQuestions.questionId })
       .from(userSeenQuestions)
       .innerJoin(triviaQuestions, eq(userSeenQuestions.questionId, triviaQuestions.id))
       .where(
         and(
           eq(userSeenQuestions.userId, userId),
           eq(triviaQuestions.movieId, movieId)
         )
       );
     return results.map(r => r.questionId);
   }
   ```

5. **Database**: PostgreSQL query via Neon HTTP driver

6. **Response**: JSON array of trivia questions returned to client

## Key Patterns

### Dependency Injection

Services receive `IStorage` as a parameter:
```typescript
export class TriviaService {
  static async getFreshQuestions(storage: IStorage, params: FreshQuestionsParams) {
    // Use storage interface
  }
}
```

Benefits:
- Testable (mock storage in tests)
- Swappable storage implementation
- Clear dependencies

### Error Handling

Services throw descriptive errors, routes catch and return HTTP responses:
```typescript
// Service
if (!movie) throw new Error(`Movie ${movieId} not found`);

// Route
try {
  const result = await service.operation();
  res.json(result);
} catch (error) {
  res.status(500).json({ error: error.message });
}
```

### Retry Logic with Exponential Backoff

Gemini AI calls use exponential backoff:
```typescript
for (let attempt = 0; attempt < maxRetries; attempt++) {
  try {
    return await generateMovieTrivia(movieTitle);
  } catch (error) {
    if (attempt < maxRetries - 1) {
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### SHA-256 Deduplication

Trivia questions use content hashing to prevent duplicates:
```typescript
const questionHash = generateSHA256Hash(JSON.stringify({ question, options, correctAnswer }));
const existing = await storage.getTriviaQuestionByHash(questionHash);
if (existing) {
  console.log('Duplicate question detected, skipping');
  continue;
}
```

## Database Design

### Neon HTTP Driver Limitations

**Important**: Krittics uses `neon-http` driver which **does not support transactions**.

**Workaround**: Sequential queries with `ON CONFLICT DO NOTHING`:
```typescript
// Instead of transaction:
await db.transaction(async (tx) => {
  await tx.insert(table1).values(data1);
  await tx.insert(table2).values(data2);
});

// Use sequential queries:
await db.insert(table1).values(data1).onConflictDoNothing();
await db.insert(table2).values(data2).onConflictDoNothing();
```

**Why not neon-websocket?**: While `neon-websocket` supports transactions, it fails with WebSocket connection errors in the Replit environment.

### Schema Management

- **Schema Definition**: `shared/schema.ts` (Drizzle schema)
- **Migrations**: NOT used (Drizzle migrations disabled)
- **Schema Sync**: `npm run db:push` or `npm run db:push --force`
- **Critical**: Never change primary key ID column types (breaks existing data)

## Security

### Authentication
- Replit Auth (OIDC) with PostgreSQL session storage
- Session cookies: `httpOnly: true`, `secure: true` (production)
- 7-day session TTL with automatic refresh

### SQL Injection Prevention
- Drizzle ORM uses parameterized queries
- All user input sanitized automatically

### CSRF Protection
- Session-based auth with secure cookies
- SameSite cookie policy

### Firebase Security Rules
```javascript
// krittics/multiplayer/rooms collection
match /krittics/multiplayer/rooms/{roomId} {
  allow create: if request.auth != null;
  allow read: if request.auth != null;
  allow update: if request.auth != null;
  allow delete: if request.auth != null && 
                   resource.data.hostId == request.auth.uid;
}
```

## Performance Optimizations

### Caching Strategy
- TanStack Query caching on frontend (5-minute default)
- Firebase connection pooling for Firestore
- Memoized OIDC config discovery (1-hour cache)

### Database Indexes
Critical indexes on:
- `user_seen_questions(userId, questionId)` - Unique constraint
- `trivia_questions(questionHash)` - Deduplication
- `friendships(userId, friendId)` - Friend lookups
- `video_progress(userId, movieId)` - Progress queries

### Lazy Loading
- Services loaded on-demand
- Route modules registered dynamically

## Monitoring & Debugging

### Logging
- Request/response logging in `server/index.ts`
- Service-level console logging for errors
- Firebase error differentiation (missing secrets vs auth disabled vs other)

### Error Messages
Services provide descriptive error messages:
```typescript
throw new Error(`Failed to generate trivia for "${movieTitle}": AI service unavailable`);
```

### Debug Mode
Google IMA SDK debug logging:
```bash
IMA_DEBUG_MODE=true npm run dev
```

## Development Workflow

### Adding a New Feature

1. **Define Types** (if needed):
   - Add to `shared/schema.ts` (Drizzle schema)
   - Add to `models/IStorage.ts` (interface)

2. **Implement Storage**:
   - Add methods to `storage.ts` (PostgreSQL implementation)

3. **Create Service**:
   - Add business logic to `services/XxxService.ts`
   - Inject `IStorage` dependency

4. **Add Routes**:
   - Create `routes/xxxRoutes.ts`
   - Register in `routes/index.ts`

5. **Test**:
   - Manual testing via frontend
   - E2E tests with Playwright

6. **Deploy**:
   - `npm run build`
   - Replit "Publish" button

### Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: `camelCase` for functions/variables, `PascalCase` for types/classes
- **Exports**: Named exports preferred over default exports
- **Comments**: JSDoc for public functions, inline comments for complex logic
- **Error Handling**: Always catch and handle errors with descriptive messages

## Future Improvements

### Short-term
- [ ] Add unit tests for services
- [ ] Implement API rate limiting
- [ ] Add request validation with Zod
- [ ] Migrate to neon-websocket when Replit support improves

### Long-term
- [ ] Microservices architecture for scaling
- [ ] Redis caching layer
- [ ] GraphQL API alternative
- [ ] Real-time WebSocket updates for leaderboards

---

**Maintained by Krittics Team** | Last Updated: November 2025
