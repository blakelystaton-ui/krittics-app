# Krittics - AI-Powered Movie Trivia Platform

## Overview
Krittics is an immersive movie trivia platform that combines cinematic experiences with AI-powered trivia challenges. Built with React, Express, and Gemini AI, it features both single-player Deep Dive mode and competitive Krossfire multiplayer (coming soon).

## Current State (MVP)
The application is a fully functional movie trivia platform with:
- **Movie Player Interface**: Video player with controls, progress tracking, and trivia notification system
- **Deep Dive Trivia**: AI-generated movie trivia with 5 unique questions per game
- **Movie Library**: 16 movies with search by title/description and filters for genre and year
- **Leaderboard System**: Real-time rankings with daily/weekly/all-time filtering and user highlighting
- **Krossfire Lobby**: Competitive mode UI with leaderboards (gameplay coming in future phase)
- **Dark Mode**: Full dark/light theme support with smooth transitions
- **Responsive Design**: Beautiful UI across all device sizes

## Recent Changes (November 2025)
### Latest (November 3, 2025)
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
   - Lobby with game mode selection
   - Leaderboard preview showing top players
   - "How to Play" instructions
   - Matchmaking UI (full gameplay coming soon)

## User Preferences
- Primary theme: Dark mode by default (cinematic experience)
- Color scheme: Blue accent (#1F5EAB / hsl(217 91% 35%)) on dark backgrounds
- Typography: Outfit (display headings), Inter (body text)
- Visual style: Content-first design, smooth transitions, subtle elevations

## Project Architecture

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM, Neon serverless database
- **AI**: Google Gemini 2.5 Flash (via Replit AI Integrations)
- **State Management**: TanStack Query v5
- **Storage**: DatabaseStorage (PostgreSQL persistence)
- **Routing**: Wouter (lightweight client-side routing)

### Key Files Structure
```
client/
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Navigation with page switcher
│   │   ├── MoviePlayer.tsx         # Video player with controls
│   │   ├── DeepDiveTrivia.tsx     # Trivia game component
│   │   ├── ThemeProvider.tsx       # Dark/light mode context
│   │   ├── ThemeToggle.tsx         # Theme switcher button
│   │   └── ui/                     # shadcn components
│   ├── pages/
│   │   ├── HomePage.tsx            # Movie player + trivia page
│   │   ├── KrossfirePage.tsx       # Competitive mode lobby
│   │   └── MovieLibraryPage.tsx    # Movie library with search/filters
│   └── App.tsx                     # Main app with routing
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
- Krossfire multiplayer gameplay not yet implemented (UI and leaderboard complete)
- No user authentication system (using local storage userId)
- Movie library filters limited to genre/year (rating/duration deferred)
- Deep Dive trivia sessions not fully persisted (answers not saved)

## Next Phase Features
- Real video streaming integration
- Real-time multiplayer Krossfire gameplay with WebSocket
- User authentication with Firebase (Google + email/password)
- User profiles with achievement badges and game history
- Complete trivia persistence (save answers, track progress)
- Private room creation for friends
- Social sharing of trivia results
- Personalized movie recommendations based on viewing history

## Development Notes
- Uses Vite dev server (frontend) + Express (backend) on same port
- Workflow: `npm run dev` starts both servers
- Hot reload enabled for rapid development
- Dark mode persisted in localStorage
- User ID generated via crypto.randomUUID() and stored locally
