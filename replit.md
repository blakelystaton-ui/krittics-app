# Krittics - AI-Powered Movie Trivia Platform

## Overview
Krittics is an immersive movie trivia platform that combines cinematic experiences with AI-powered trivia challenges. It features a single-player Deep Dive mode, multiplayer Private Rooms with live chat, and competitive Krossfire leaderboards. The platform showcases 4 open-source Blender Foundation movies with mobile-compatible video hosting from Google Cloud Storage, providing a Netflix-style browsing experience for movie discovery alongside engaging trivia.

## User Preferences
- Primary theme: Dark mode only (locked, no theme toggle)
- Color scheme: Unified teal accent (#1ba9af) with gradient border aesthetic throughout
- Typography: Outfit (display headings), Inter (body text)
- Visual style: Content-first design, smooth transitions, subtle elevations, teal gradient aesthetics

## System Architecture
The application is built with a **React 18** frontend (Vite, Tailwind CSS, shadcn/ui) and an **Express.js** backend (TypeScript). Data persistence uses **PostgreSQL** with **Drizzle ORM** for core application data (users, movies, games) and **Firebase Firestore** for real-time multiplayer features (rooms, chat). **Google Gemini 2.5 Flash** (via Replit AI Integrations) is used for AI-powered trivia generation. **TanStack Query v5** manages frontend data fetching, and **Wouter** handles client-side routing.

### UI/UX Decisions
- **Netflix-style Browse Page**: Features an auto-rotating hero carousel with 2.5-second crossfade transitions, dynamic color theming based on featured movies, carousel indicators positioned above content sections, horizontal scrolling content rows, and movie cards with hover effects.
- **Queue Page**: Personal watchlist where users can manage movies they want to watch, featuring a teal gradient hero section and grid layout for saved movies.
- **Dynamic Color Theming**: Movies influence the UI's accent colors for buttons, badges, and text, with smooth transitions.
- **Responsive Design**: Mobile-first approach with smooth momentum scrolling on touch devices.
- **Header Navigation**: Browse, Krossfire, and Queue buttons with teal gradient aesthetic. Avatar with dropdown (Help, Sign Out) for logged-in users, sign-in button otherwise, integrated with Replit Auth.

### Technical Implementations
- **Authentication**: Utilizes Replit Auth as an OpenID Connect provider, supporting various login methods and session management with PostgreSQL.
- **Onboarding & Interests**: New users complete an interests selection process upon first login, choosing from 10 movie genres (Action, Comedy, Drama, Horror, Sci-Fi, Romance, Documentary, Animation, Thriller, Family). Interests are stored in PostgreSQL and used for crew matching and personalized ad targeting.
- **Crew Matching**: PostgreSQL-powered matchmaking system that finds users with shared interests using array overlap queries. Displays top 20 matches ranked by number of shared interests, showing profile avatars and common genre preferences.
- **Deep Dive Trivia**: AI-generated trivia with 5 unique questions per game, providing immediate visual feedback and score tracking. Features teal gradient aesthetics with centralized CSS utilities (.teal-gradient-bg, .teal-icon-glow, .teal-icon-subtle) for consistent visual branding across loading, initial, and final score screens. Deep Dive button intelligently hides when the trivia notification appears at 95%+ video progress to avoid duplicate controls.
- **Movie Catalog**: 4 open-source Blender Foundation movies with mobile-compatible video hosting from Google Cloud Storage: Big Buck Bunny (2008, Comedy), Sintel (2010, Fantasy), Tears of Steel (2012, Science Fiction), and Elephants Dream (2006, Surreal). All videos work reliably across desktop and mobile devices including iOS Safari.
- **Crew Command Center (Private Rooms)**: Real-time room creation/joining with unique codes, live chat, and host controls, powered by Firebase Firestore. Requires Firebase Anonymous Authentication to be enabled in the Firebase Console. Features unified teal gradient aesthetics with gradient-bordered CTAs, teal-icon-glow host badges, and teal-accented chat messages for visual consistency with Deep Dive trivia. Hero section uses darkened teal gradient for optimal text visibility.
  - **Friends System**: Integrated friend search and management within Private Rooms. When creating a crew call, users can search for friends by name/email and view their top 10 most frequent collaborators, sorted by interaction count. Friend interactions are automatically tracked across room joins, messages, and games. PostgreSQL stores friendships and interaction metrics for persistent friend rankings.
- **Firebase Error States**: Tracks three distinct error types via `authError` state:
  - `missing-secrets`: Environment variables not configured
  - `anonymous-auth-disabled`: Firebase Anonymous Auth not enabled (auth/admin-restricted-operation)
  - Other error codes: Network, initialization, or other Firebase failures
  Each error type displays tailored guidance with actionable steps.
- **Leaderboard System**: Real-time rankings with daily/weekly/all-time filtering and user highlighting, persisted in PostgreSQL.
- **API Endpoints**: Comprehensive set of RESTful APIs for movies, trivia generation, game sessions, leaderboards, and friend management (search, add, top friends).
- **CSS Gradient System**: Centralized teal gradient utilities using CSS custom properties (--teal, --teal-light, --teal-dark with RGB variants) for maintainable, reusable gradient effects. Includes 135° multi-stop gradient backgrounds and triple-layer glow effects for icons.

### System Design Choices
- **Hybrid Storage**: PostgreSQL for structured, persistent data and Firebase Firestore for real-time, dynamic data.
- **AI Integration**: Gemini 2.5 Flash provides structured JSON output for trivia questions, including retry logic.
- **Graceful Degradation**: Multiplayer features are designed to work in a fallback mode if Firebase is not configured.
- **Smart Error Handling**: Firebase error handling differentiates between three error states (missing secrets, anonymous auth disabled, other errors) and provides contextually appropriate user guidance with actionable instructions.

## External Dependencies
- **Replit Auth**: For user authentication and session management.
- **Google Gemini 2.5 Flash**: Accessed via Replit AI Integrations for AI-powered trivia generation.
- **Firebase Firestore**: For real-time multiplayer functionality (Private Rooms, live chat).
- **PostgreSQL**: Primary database for application data persistence.
- **Drizzle ORM**: ORM for interacting with PostgreSQL.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **shadcn/ui**: Component library for UI elements.
- **TanStack Query v5**: For data fetching, caching, and state management.
- **Wouter**: Lightweight client-side routing library.