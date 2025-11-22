# Krittics - AI-Powered Movie Trivia Platform

**Production Site:** [www.krittics.com](https://www.krittics.com)  
**Status:** Production-ready with comprehensive feature set

## Overview

Krittics is a cross-platform Netflix-style movie streaming platform featuring open-source Creative Commons films with AI-powered trivia, real-time multiplayer rooms, competitive leaderboards, and AVOD (Ad-Supported Video On Demand) monetization. Built with React/TypeScript (web) and Ionic/Angular (mobile).

### Key Features
- 🎬 **Netflix-Style Browse Experience**: Auto-rotating hero carousel, horizontal scrolling content rows, dynamic color theming
- 🤖 **AI-Powered Deep Dive Trivia**: Gemini 2.0 Flash generates unique questions with intelligent pool management and SHA-256 deduplication
- 🎮 **Multiplayer Private Rooms**: Real-time Firebase-powered rooms with synchronized video playback, live chat, and host controls
- 🏆 **Competitive Leaderboards**: Daily/weekly/all-time rankings with user highlighting
- 📱 **Cross-Platform**: Works on iOS, Android, Web/Desktop, and Smart TVs
- 💰 **Video Advertising**: Google IMA SDK integration with VMAP-based linear ads (pre-roll, mid-roll, post-roll)
- 🎨 **Dark Mode Only**: Locked teal accent theme (#1ba9af) with gradient aesthetics
- 👥 **Friend System**: Search friends, track interactions, quick invite to rooms
- 📚 **Insights Blog**: 8 in-depth articles on AVOD strategy, tech stack, and platform development

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** + **shadcn/ui** for UI components
- **TanStack Query v5** for data fetching/caching
- **Wouter** for client-side routing
- **Firebase** for real-time multiplayer (Firestore + Anonymous Auth)
- **Video.js** with **videojs-ima** for video playback and ads

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** (Neon HTTP driver via Drizzle ORM)
- **Replit Auth** (OIDC) for authentication
- **Google Gemini 2.0 Flash** (via Replit AI Integrations) for trivia generation
- **Firebase Firestore** for real-time data (rooms, chat)

### Mobile
- **Ionic Framework** with Angular (in development)
- Connects to same Express API as web app

## Project Structure

```
krittics/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Route pages (Browse, Watch, Crew, etc.)
│   │   ├── lib/             # Utilities and client-side logic
│   │   └── App.tsx          # Main app entry point
│   └── index.html
│
├── server/                    # Express backend
│   ├── config/              # Configuration files
│   │   ├── db.ts           # Database connection (Neon HTTP)
│   │   └── gemini.ts       # Gemini AI client setup
│   ├── middleware/          # Express middleware
│   │   └── auth.ts         # Replit Auth (OIDC) middleware
│   ├── models/              # TypeScript interfaces
│   │   └── IStorage.ts     # Storage interface definition
│   ├── routes/              # API route modules
│   │   ├── index.ts        # Consolidated router
│   │   ├── movieRoutes.ts  # Movie catalog endpoints
│   │   ├── triviaRoutes.ts # Trivia generation/game endpoints
│   │   ├── userRoutes.ts   # User/friend management endpoints
│   │   ├── watchlistRoutes.ts      # Queue/watchlist endpoints
│   │   ├── videoProgressRoutes.ts  # Video progress tracking
│   │   └── leaderboardRoutes.ts    # Leaderboard endpoints
│   ├── services/            # Business logic layer
│   │   ├── GeminiService.ts        # AI trivia generation
│   │   ├── TriviaService.ts        # Trivia pool management
│   │   ├── MovieService.ts         # Movie catalog logic
│   │   ├── GameService.ts          # Game session management
│   │   ├── UserService.ts          # User operations
│   │   ├── WatchlistService.ts     # Watchlist logic
│   │   └── VideoProgressService.ts # Progress tracking
│   ├── utils/               # Utility functions
│   │   └── crypto.ts       # SHA-256 hashing, UUID generation
│   ├── storage.ts           # Database implementation (IStorage)
│   ├── seed.ts             # Database seeding script
│   └── index.ts            # Server entry point
│
├── shared/                   # Shared types between client/server
│   └── schema.ts           # Drizzle schema definitions
│
├── krittics-mobile/          # Ionic/Angular mobile app
│   ├── src/
│   │   ├── app/            # Angular modules/components
│   │   └── environments/   # Environment configs
│   └── capacitor.config.ts
│
├── attached_assets/          # Static assets
│   ├── generated_images/   # AI-generated images
│   ├── stock_images/       # Stock photography
│   └── krittics-screenshots/ # Platform screenshots
│
├── pages/                    # Legal pages (Terms, Privacy)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── drizzle.config.ts
└── replit.md               # Project documentation (user prefs, architecture)
```

## Database Schema

### Core Tables
- **users**: User profiles (id, email, firstName, lastName, profileImageUrl, interests)
- **movies**: Movie catalog (id, title, synopsis, director, cast, year, adTagUrl, cloudStorageUrl)
- **game_sessions**: Trivia game history (id, userId, movieId, score, gameMode)
- **trivia_questions**: Question pool (id, movieId, questionText, options, correctAnswer, questionHash)
- **user_seen_questions**: Tracks which questions users have seen (userId, questionId, seenAt)
- **answers**: User answer history (id, sessionId, questionId, selectedAnswer, isCorrect)
- **leaderboard_entries**: Cached leaderboard data (userId, gameMode, totalScore, gamesPlayed)
- **friendships**: Friend relationships (userId, friendId, createdAt)
- **friend_interactions**: Interaction tracking (userId, friendId, interactionType, count, lastInteractionAt)
- **watchlist**: User movie queue (userId, movieId, addedAt)
- **video_progress**: Watch progress tracking (userId, movieId, progressSeconds, completed, lastWatchedAt)
- **sessions**: Express session store (sid, sess, expire)

### Database Driver Notes
- **Driver**: Neon HTTP (`@neondatabase/serverless` with `drizzle-orm/neon-http`)
- **Limitations**: Transactions not supported (use sequential queries with `ON CONFLICT DO NOTHING`)
- **Alternative**: Neon WebSocket driver supports transactions but fails in Replit environment

## Key Architectural Decisions

### Hybrid Storage Strategy
- **PostgreSQL**: Persistent, structured data (users, movies, games, trivia, leaderboards)
- **Firebase Firestore**: Real-time, dynamic data (multiplayer rooms, live chat, synchronized video state)

### Trivia System Architecture
**Problem**: Generate unique trivia questions without duplicates while handling concurrent requests

**Solution**: "Mark as Seen Immediately" approach
1. Query unseen questions from PostgreSQL pool
2. If insufficient pool → Generate new questions via Gemini AI
3. Use SHA-256 hash deduplication to prevent storing duplicate questions
4. Mark selected questions as "seen" immediately (before game starts)
5. Auto-reset user's seen history when 80%+ of pool is exhausted

**Trade-offs**:
- Questions "wasted" if user abandons game without playing
- Minimizes (but doesn't eliminate) duplicates in concurrent requests
- Neon HTTP driver limitation: No transaction support for atomic SELECT→INSERT

**Guarantees**:
- Zero duplicates in sequential requests for individual users
- Per-movie question isolation (separate pools per movie)
- Gemini AI retry logic with exponential backoff (3 attempts)

### Video Advertising (Google IMA SDK)
- **Linear VMAP ads**: Pre-roll, mid-roll (50% progress), post-roll
- **Yellow "AD" badge overlay**: React state-managed, positioned top-left with Tailwind styling
- **Three-tier ad tag config**: Per-movie `adTagUrl` → `VITE_AD_TAG_URL` env var → Google test VMAP
- **No fullscreen gating**: Ads play automatically for maximum monetization
- **Debug mode**: Configurable via `IMA_DEBUG_MODE` env var

### Authentication Flow
- **Replit Auth** (OIDC) with multi-domain support
- Session storage in PostgreSQL (`sessions` table via `connect-pg-simple`)
- Automatic user profile creation/update on login
- Firebase Anonymous Authentication for multiplayer rooms (no Replit Auth required for chat)

### Firebase Integration
- **Firestore Collection**: `krittics/multiplayer/rooms`
- **Security Rules**: Authenticated users can create/read rooms, hosts can delete
- **Anonymous Auth**: Enabled for guest participation in rooms
- **Smart Error Handling**: Differentiates missing secrets, auth disabled, and other errors

### Cross-Platform Compatibility
- **Mobile-compatible video URLs**: Google Cloud Storage with CORS enabled
- **iOS Safari optimizations**: No aggressive caching in development, proper video controls
- **Responsive design**: Mobile-first approach with smooth momentum scrolling
- **Smart TV support**: All features work on WebView-based TV browsers

## Environment Variables

### Required (Secrets)
```bash
DATABASE_URL=              # Neon PostgreSQL connection string
SESSION_SECRET=            # Express session encryption key
REPL_ID=                  # Replit app ID for OIDC
ISSUER_URL=               # OIDC issuer URL (default: https://replit.com/oidc)
AI_INTEGRATIONS_GEMINI_API_KEY=  # Auto-provided by Replit AI Integrations
VITE_FIREBASE_API_KEY=    # Firebase Web API key
VITE_FIREBASE_PROJECT_ID= # Firebase project ID
VITE_FIREBASE_APP_ID=     # Firebase app ID
```

### Optional
```bash
VITE_AD_TAG_URL=          # Global ad tag URL (VMAP format)
IMA_DEBUG_MODE=false      # Enable Google IMA SDK debug logging
NODE_ENV=development      # Environment mode
PORT=5000                 # Server port (default: 5000)
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create tables (Drizzle will read schema.ts)
npm run db:push

# Seed database with 4 Blender Foundation movies
npm run seed
```

### 3. Configure Environment Variables
- Set required secrets in Replit Secrets panel
- Firebase secrets (`VITE_FIREBASE_*`) are auto-configured via Replit integration
- Gemini API key (`AI_INTEGRATIONS_GEMINI_API_KEY`) is auto-provided

### 4. Run Development Server
```bash
npm run dev
```
Server runs on port 5000 (frontend + backend on same port via Vite middleware)

### 5. Build for Production
```bash
npm run build
npm start
```

## Mobile App Setup (iOS/Android)

### Prerequisites
- Node.js 18+
- Ionic CLI: `npm install -g @ionic/cli`
- Xcode (for iOS) or Android Studio (for Android)

### Build Mobile App
```bash
cd krittics-mobile
npm install
ionic capacitor sync
```

### Run on Device
```bash
# iOS (requires Mac with Xcode)
ionic capacitor open ios

# Android
ionic capacitor open android
```

### Mobile Configuration
- Environment configs: `krittics-mobile/src/environments/`
- API endpoint: Points to same Express backend as web app
- Firebase: Uses same Firebase project as web app

## API Documentation

### Authentication
- `GET /api/login` - Initiate Replit Auth login
- `GET /api/callback` - OIDC callback handler
- `POST /api/logout` - Logout and destroy session

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by ID

### Trivia & Games
- `GET /api/trivia/fresh?userId=X&movieId=Y&count=5` - Get fresh questions for user
- `POST /api/trivia/games` - Create new game session
- `PATCH /api/trivia/games/:id` - Update game session (score, status)
- `POST /api/trivia/games/:sessionId/answers` - Submit answer

### Leaderboard
- `GET /api/leaderboard?mode=deep-dive&limit=20&period=all-time` - Get leaderboard

### Friends
- `GET /api/users/search?q=john` - Search users by name/email
- `POST /api/users/friends` - Add friend
- `GET /api/users/friends` - Get friends list with interaction counts
- `GET /api/users/crew-match` - Find users with shared interests

### Watchlist
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add movie to watchlist
- `DELETE /api/watchlist/:movieId` - Remove from watchlist

### Video Progress
- `POST /api/video-progress` - Update watch progress
- `GET /api/video-progress/:movieId` - Get progress for movie
- `GET /api/video-progress/continue-watching` - Get continue watching list

## Feature Deep Dives

### Netflix-Style Browse Page
- **Auto-rotating hero carousel**: 2.5-second crossfade transitions between featured movies
- **Dynamic color theming**: Movies influence UI accent colors (buttons, badges, text)
- **Carousel indicators**: Positioned above content sections with smooth animations
- **Horizontal scrolling rows**: Touch-optimized momentum scrolling for mobile
- **Movie cards**: Hover effects, metadata display, click-to-watch navigation

### Deep Dive Trivia
- **AI Generation**: Gemini 2.0 Flash creates 5 unique questions per game
- **Visual Feedback**: Immediate correct/incorrect indication with teal gradient aesthetics
- **Score Tracking**: Real-time score display, final score screen with sharing
- **Smart Triggering**: Button hides when trivia notification appears at 95%+ video progress
- **CSS Utilities**: Centralized `.teal-gradient-bg`, `.teal-icon-glow`, `.teal-icon-subtle` classes

### Private Rooms (Crew Command Center)
- **Real-time sync**: Host controls propagate to all members within 100ms
- **Synchronized playback**: Host play/pause/seek actions sync to all video players
- **Live chat**: Firebase Firestore-powered instant messaging
- **Host controls**: Exclusive movie selection, member management, room deletion
- **Quick Invite**: One-click friend invite that auto-creates room + sends welcome message
- **In-Room Invites**: Host-only "+Add" button with top 5 friend suggestions ranked by interactions

### Continue Watching
- **Cross-platform sync**: Works on iOS, Android, Web/Desktop, Smart TVs
- **Progress restoration**: Appears when movie watched 15+ seconds and not completed
- **Optimized queries**: Waits for auth to finish loading (no blocking on user state)
- **Reliable on all devices**: Tested on iPad, mobile Safari, desktop browsers

### Search Dialog
- **Teal gradient styling**: Dark zinc background with teal-accented borders
- **Search history**: Persists last 5 searched movies in localStorage (newest first)
- **Intelligent history**: Only shows when input empty, makes way for live results when typing
- **Clear All button**: Instant history reset
- **Position indicators**: History items display with #1-5 badges

## Testing

### E2E Testing
```bash
# Run Playwright tests (configured for cross-browser testing)
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Browse page: Hero carousel rotates, movie cards load
- [ ] Deep Dive: Questions unique, score tracking works
- [ ] Private Rooms: Room creation, chat, video sync
- [ ] Leaderboard: Rankings display correctly
- [ ] Friends: Search, add, invite to room
- [ ] Watchlist: Add/remove movies
- [ ] Video Progress: Continue watching works
- [ ] Search: History persists, live results appear
- [ ] Ads: Pre-roll, mid-roll, post-roll play correctly
- [ ] Mobile: All features work on iOS/Android

## Deployment

### Web Deployment
Krittics uses Replit's built-in deployment (publishing) system:
1. Click "Publish" button in Replit interface
2. Deployment handles building, hosting, TLS, health checks
3. App available at `.replit.app` domain or custom domain (www.krittics.com)

### Mobile Deployment
**iOS** (requires Mac with Xcode):
1. Open project in Xcode: `ionic capacitor open ios`
2. Configure signing & capabilities
3. Build and archive for App Store submission

**Android**:
1. Open project in Android Studio: `ionic capacitor open android`
2. Generate signed APK/AAB
3. Upload to Google Play Console

## Production Features

### Live Site Optimizations
- **Teaser Overlay**: Semi-transparent "LAUNCHING SOON" overlay (75% opacity) with `pointer-events: none`
- **SEO-Friendly**: Google bots can fully access all content for indexing
- **Subtitle Transparency**: "(Full site visible to Google reviewers)" note for clarity

### Performance Optimizations
- **TanStack Query caching**: Reduces redundant API calls
- **Firebase connection pooling**: Efficient Firestore queries
- **Lazy loading**: Components load on-demand
- **Image optimization**: WebP format with fallbacks

### Security
- **CSRF protection**: Express session cookies with httpOnly, secure flags
- **SQL injection prevention**: Drizzle ORM parameterized queries
- **XSS protection**: React automatic escaping
- **Firebase security rules**: Authenticated users only for room operations

## Content Library

### Open-Source Creative Commons Films
1. **Big Buck Bunny** (2008) - Comedy, directed by Sacha Goedegebure
2. **Sintel** (2010) - Fantasy, directed by Colin Levy
3. **Tears of Steel** (2012) - Science Fiction, directed by Ian Hubert
4. **Elephants Dream** (2006) - Surreal, directed by Bassam Kurdali

All films hosted via Google Cloud Storage with mobile-compatible URLs.

### Krittics Insights Blog
8 in-depth articles exploring:
- Interactive AVOD market dominance
- Krossfire engagement economics
- Firebase/Gemini/Node.js tech stack rationale
- Content licensing for startups
- Monetization metrics (ARPU, eCPM, LTV, Fill Rate)
- Firebase backend scaling best practices
- Beta testing methodologies
- Mobile-first optimization strategies

## Contributing

This is a production project for www.krittics.com. Contributions are not currently accepted.

## License

Proprietary - All rights reserved

---

**Built with ❤️ using React, TypeScript, Express, PostgreSQL, Firebase, and Google Gemini AI**
