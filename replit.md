# Krittics - AI-Powered Movie Trivia Platform

## Overview
Krittics is an immersive movie trivia platform that combines cinematic experiences with AI-powered trivia challenges. Built with React, Express, and Gemini AI, it features both single-player Deep Dive mode and competitive Krossfire multiplayer (coming soon).

## Current State (MVP)
The application is a fully functional movie trivia platform with:
- **Movie Player Interface**: Video player with controls, progress tracking, and trivia notification system
- **Deep Dive Trivia**: AI-generated movie trivia with 5 unique questions per game
- **Competitive UI**: Krossfire lobby and leaderboard preview (gameplay coming in future phase)
- **Dark Mode**: Full dark/light theme support with smooth transitions
- **Responsive Design**: Beautiful UI across all device sizes

## Recent Changes (November 2025)
### Database Migration (Latest)
- Created PostgreSQL database with complete schema (users, movies, game_sessions, trivia_questions, answers, achievements, user_achievements, leaderboard_entries, video_progress)
- Migrated from in-memory storage to DatabaseStorage with full persistence
- Seeded database with 4 sample movies and achievement badges
- Created test user for development

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
│   │   └── KrossfirePage.tsx       # Competitive mode lobby
│   └── App.tsx                     # Main app with routing
│
server/
├── gemini.ts                       # Gemini AI integration
├── storage.ts                      # In-memory data storage
└── routes.ts                       # API endpoints

shared/
└── schema.ts                       # Shared TypeScript types & Zod schemas
```

### API Endpoints
- `GET /api/movies` - Fetch all available movies
- `GET /api/movies/:id` - Get specific movie details
- `POST /api/trivia/generate` - Generate AI trivia questions
- `POST /api/games` - Create new game session
- `GET /api/games/:id` - Get game session details
- `POST /api/games/:id/answer` - Submit answer
- `PATCH /api/games/:id/complete` - Complete game and get results
- `GET /api/leaderboard/:gameMode` - Get leaderboard rankings
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
- In-memory storage (data resets on server restart)
- Krossfire multiplayer gameplay not yet implemented
- No user authentication system
- Single sample movie available

## Next Phase Features
- Real video streaming integration
- PostgreSQL database for data persistence
- Real-time multiplayer Krossfire gameplay
- Private room creation for friends
- User profiles with achievement badges
- Extended movie library with search/filters
- Social sharing of trivia results
- Personalized movie recommendations

## Development Notes
- Uses Vite dev server (frontend) + Express (backend) on same port
- Workflow: `npm run dev` starts both servers
- Hot reload enabled for rapid development
- Dark mode persisted in localStorage
- User ID generated via crypto.randomUUID() and stored locally
