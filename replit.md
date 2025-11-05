# Krittics - AI-Powered Movie Trivia Platform

## Overview
Krittics is an immersive movie trivia platform that combines cinematic experiences with AI-powered trivia challenges. Built with React, Express, Gemini AI, and Firebase, it features single-player Deep Dive mode, multiplayer Private Rooms with live chat, and competitive Krossfire leaderboards.

## Current State (MVP)
The application is a fully functional movie trivia platform with:
- **Browse Page**: Netflix-style streaming homescreen with auto-rotating hero carousel, horizontal scrolling rows, hover effects, and quick actions
- **Movie Player Interface**: Video player with controls, progress tracking, and trivia notification system
- **Deep Dive Trivia**: AI-generated movie trivia with 5 unique questions per game
- **Movie Library**: 16 movies with search by title/description and filters for genre and year
- **Leaderboard System**: Real-time rankings with daily/weekly/all-time filtering and user highlighting
- **Private Rooms**: Create/join rooms with unique codes, live chat, and real-time member list
- **Krossfire Lobby**: Competitive mode UI with leaderboards and private room access
- **Dark Mode**: Full dark/light theme support with smooth transitions
- **Responsive Design**: Beautiful UI across all device sizes

## Recent Changes (November 2025)
### Latest (November 5, 2025 - Phase 3)
- **Netflix-Style Browse Page**: Built cinematic streaming homescreen with auto-rotating hero carousel (6s intervals), horizontal scrolling content rows, and movie cards with hover effects
- **Dynamic Color Theming**: Each movie has unique vibrant dominant color; hero section dynamically themes based on featured movie (colored buttons, badges, indicators, title glow, gradient overlays); movie titles and progress bars show in their unique colors; smooth 1s transitions when carousel rotates
- **Hero Carousel**: 5 featured movies with large backdrop images, color-themed gradient overlays, themed "Play Now" and "More Info" buttons, color-coordinated carousel indicators
- **Content Rows**: Continue Watching (with colored progress bars), Trending Now, New Releases, Top Rated, and genre-based rows with smooth horizontal scrolling
- **Movie Cards**: 16:9 thumbnails with scale-105 hover effect, colored titles on hover, quick action buttons overlay (Play, Add to List, Info), title/metadata display
- **Navigation Enhancement**: Added "Browse" link to header navigation (Tv icon), integrated with existing routing
- **Responsive Design**: Mobile-first with breakpoints, smooth transitions (300ms for cards, 1s for color theming), scrollbar-hide utility for clean horizontal scrolling

### Earlier (November 3, 2025 - Phase 2)
- **Firebase Multiplayer Integration**: Integrated Firebase Firestore for real-time multiplayer features
- **Private Rooms System**: Create rooms with unique 6-character codes, join via code input, real-time member lists, host controls (delete/leave)
- **Live Chat**: Real-time chat within rooms using Firestore subcollections, auto-scroll to latest messages, timestamped messages
- **Graceful Fallback**: App works without Firebase configured, shows informative messages when multiplayer unavailable
- **Firebase Provider**: useFirebase hook with React StrictMode handling, stable fallback user IDs via localStorage
- **KrossfirePage Enhancement**: Active "Private Room" button linking to multiplayer features

### Earlier (November 3, 2025 - Phase 1)
- **Movie Library**: Added 12 more movies (16 total) across Fantasy, Thriller, Drama, Sci-Fi, Romance, Western, Comedy, Horror, Adventure, Animation, Action genres
- **Search & Filters**: Implemented search by title/description and filters for genre and year
- **Leaderboard System**: Built real-time rankings with time period filtering (daily/weekly/all-time), deterministic ordering for tie scores, user highlighting with "You" badge
- **Seeded Database**: Added 5 test users and 13 sample game sessions for leaderboard testing

### Database Migration
- Created PostgreSQL database with complete schema (users, movies, game_sessions, trivia_questions, answers, achievements, user_achievements, leaderboard_entries, video_progress)
- Migrated from in-memory storage to DatabaseStorage with full persistence
- Seeded database with movies, achievements, users, and game sessions

### MVP Implementation
- Implemented complete data schema for movies, trivia questions, game sessions, and answers
- Built all React components with exceptional visual quality following design guidelines
- Configured Gemini AI integration using Replit AI Integrations (no API key required)
- Implemented all backend API endpoints with proper validation and error handling
- Connected frontend to backend with TanStack Query for data fetching
- Added comprehensive loading states, error handling, and user feedback

### Key Features Implemented
1. **Movie Player**
   - Custom video controls (play/pause, volume, fullscreen)
   - Progress tracking with visual timeline
   - "Deep Dive Ready" notification at 95% completion
   - Responsive 16:9 aspect ratio container

2. **Deep Dive Trivia Game**
   - AI-generated questions using Gemini 2.5 Flash model
   - 2x2 answer grid (desktop) / stacked (mobile)
   - Immediate visual feedback for correct/incorrect answers
   - Score tracking with performance tiers (Perfect, Expert, Buff, Novice)
   - Beautiful loading states with pulse animations
   - Graceful error handling with retry functionality

3. **Krossfire Competitive Mode**
   - Lobby with game mode selection (Quick Match + Private Rooms)
   - Leaderboard preview showing top players
   - "How to Play" instructions
   - Private Rooms feature active and accessible

4. **Private Rooms Multiplayer**
   - Create private rooms with unique 6-character codes
   - Join rooms by entering shared codes
   - Real-time member list with host badge
   - Live chat with message history and auto-scroll
   - Host controls: delete room, leave room
   - Works with or without Firebase configured (graceful fallback)

## User Preferences
- Primary theme: Dark mode by default (cinematic experience)
- Color scheme: Blue accent (#1F5EAB / hsl(217 91% 35%)) on dark backgrounds
- Typography: Outfit (display headings), Inter (body text)
- Visual style: Content-first design, smooth transitions, subtle elevations

## Project Architecture

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM (persistent data), Firebase Firestore (real-time multiplayer)
- **AI**: Google Gemini 2.5 Flash (via Replit AI Integrations)
- **Real-time**: Firebase Firestore for multiplayer rooms and chat
- **State Management**: TanStack Query v5
- **Storage**: Hybrid - PostgreSQL (users, movies, games) + Firestore (rooms, chat, live state)
- **Routing**: Wouter (lightweight client-side routing)

### Key Files Structure
```
client/
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Navigation with Browse, Player, Library, Krossfire
│   │   ├── MoviePlayer.tsx         # Video player with controls
│   │   ├── DeepDiveTrivia.tsx     # Trivia game component
│   │   ├── ThemeProvider.tsx       # Dark/light mode context
│   │   ├── ThemeToggle.tsx         # Theme switcher button
│   │   └── ui/                     # shadcn components
│   ├── lib/
│   │   └── firebase.tsx            # Firebase config, auth, and useFirebase hook
│   ├── pages/
│   │   ├── BrowsePage.tsx          # Netflix-style homescreen with hero carousel
│   │   ├── HomePage.tsx            # Movie player + trivia page
│   │   ├── KrossfirePage.tsx       # Competitive mode lobby
│   │   ├── MovieLibraryPage.tsx    # Movie library with search/filters
│   │   └── PrivateRoomsPage.tsx    # Multiplayer room creation/joining/chat
│   └── App.tsx                     # Main app with routing + Firebase provider
│
server/
├── gemini.ts                       # Gemini AI integration
├── storage.ts                      # DatabaseStorage with PostgreSQL
├── routes.ts                       # API endpoints
├── db.ts                           # Database connection
└── seed.ts                         # Database seeding script

shared/
└── schema.ts                       # Shared TypeScript types & Zod schemas
```

### API Endpoints
- `GET /api/movies` - Fetch all available movies
- `GET /api/movies/search?q={query}&genre={genre}&year={year}` - Search movies with filters
- `GET /api/movies/:id` - Get specific movie details
- `POST /api/trivia/generate` - Generate AI trivia questions
- `POST /api/games` - Create new game session
- `GET /api/games/:id` - Get game session details
- `POST /api/games/:id/answer` - Submit answer
- `PATCH /api/games/:id/complete` - Complete game and get results
- `GET /api/leaderboard/:gameMode?period={period}&limit={limit}` - Get leaderboard rankings (supports daily/weekly/all-time)
- `GET /api/users/:userId/sessions` - Get user's game history

### Data Models
- **Movie**: Title, description, duration, poster/video URLs
- **TriviaQuestion**: Question text, 4 options array, correct answer
- **GameSession**: User ID, movie ID, score, game mode, status
- **Answer**: Session ID, question ID, user's answer, correctness

## AI Integration
The app uses **Gemini 2.5 Flash** via Replit AI Integrations for trivia generation:
- Structured JSON output using schema validation
- 5 unique questions per movie with 4 options each
- Spoiler-free questions about plot, quotes, characters, and behind-the-scenes facts
- Retry logic with exponential backoff (3 attempts: 1s, 2s, 4s delays)
- Environment variables: `AI_INTEGRATIONS_GEMINI_BASE_URL`, `AI_INTEGRATIONS_GEMINI_API_KEY`

## Firebase Integration
The app uses **Firebase Firestore** for real-time multiplayer features:
- Real-time room state synchronization across clients using onSnapshot listeners
- Chat messages stored in nested subcollections (`krittics/multiplayer/rooms/{code}/messages`)
- Graceful fallback mode when Firebase not configured (localStorage fallback user IDs)
- Optional environment variables: `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_API_KEY`
- React StrictMode compatible with proper initialization guards (getApps/getApp pattern)

## Design System
Following `design_guidelines.md`:
- **Spacing**: Consistent p-8 for cards, 4-unit gaps between elements
- **Typography**: Outfit display font for headings, Inter for body
- **Colors**: Primary blue (#1F5EAB), semantic tokens for different states
- **Components**: shadcn/ui Button, Card, Badge with hover-elevate utilities
- **Responsive**: Mobile-first with breakpoints at 640px, 768px, 1024px, 1280px
- **Animations**: Smooth 300ms transitions, subtle scale effects

## Known Limitations (MVP)
- No actual video playback (mock player interface only)
- Real-time Krossfire trivia gameplay not yet implemented (rooms and chat complete)
- Firebase multiplayer optional (works in fallback mode without Firebase)
- No user authentication system (using localStorage user IDs, anonymous Firebase fallback)
- Movie library filters limited to genre/year (rating/duration deferred)
- Deep Dive trivia sessions not fully persisted (answers not saved)
- Private rooms: No presence cleanup for disconnected members (future enhancement)
- Private rooms: Basic host controls only (kick/promote features deferred)

## Next Phase Features
- Real video streaming integration
- Real-time multiplayer Krossfire trivia gameplay (synchronized questions, countdown timers, live scoring)
- User authentication with Firebase Auth (Google + email/password)
- User profiles with achievement badges and game history
- Complete trivia persistence (save answers, track progress)
- Enhanced private rooms: presence detection, member kick/promote, video sync
- Social sharing of trivia results
- Personalized movie recommendations based on viewing history
- Quick Match auto-matchmaking for competitive play

## Development Notes
- Uses Vite dev server (frontend) + Express (backend) on same port
- Workflow: `npm run dev` starts both servers
- Hot reload enabled for rapid development
- Dark mode persisted in localStorage
- User ID: Generated via crypto.randomUUID(), stored in localStorage as 'krittics-user-id'
- Firebase optional: App works in fallback mode if Firebase secrets not configured
- Firestore structure: `krittics/multiplayer/rooms/{roomCode}` with `messages` subcollection
