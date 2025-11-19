# Krittics - AI-Powered Movie Trivia Platform

## Overview
Krittics is an immersive movie trivia platform that combines cinematic experiences with AI-powered trivia challenges. It features a single-player Deep Dive mode, multiplayer Private Rooms with live chat, and competitive Krossfire leaderboards. The platform showcases 4 open-source Blender Foundation movies with mobile-compatible video hosting from Google Cloud Storage, providing a Netflix-style browsing experience for movie discovery alongside engaging trivia.

### Platform Structure
- **Web Application** (client/, server/, shared/): Production-ready React/TypeScript app with Express backend
- **Mobile Application** (krittics-mobile/): Ionic/Angular companion app (in development) that connects to the same Express API

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
- **Header Navigation**: Browse, Krossfire, Queue, Insights, and Mission buttons with teal gradient aesthetic. Avatar with dropdown (Help, Sign Out) for logged-in users, sign-in button otherwise, integrated with Replit Auth.

### Technical Implementations
- **Authentication**: Utilizes Replit Auth as an OpenID Connect provider, supporting various login methods and session management with PostgreSQL.
- **Onboarding & Interests**: New users complete an interests selection process upon first login, choosing from 10 movie genres (Action, Comedy, Drama, Horror, Sci-Fi, Romance, Documentary, Animation, Thriller, Family). Interests are stored in PostgreSQL and used for crew matching and personalized ad targeting.
- **Crew Matching**: PostgreSQL-powered matchmaking system that finds users with shared interests using array overlap queries. Displays top 20 matches ranked by number of shared interests, showing profile avatars and common genre preferences.
- **Deep Dive Trivia**: AI-generated trivia with 5 unique questions per game, providing immediate visual feedback and score tracking. Features teal gradient aesthetics with centralized CSS utilities (.teal-gradient-bg, .teal-icon-glow, .teal-icon-subtle) for consistent visual branding across loading, initial, and final score screens. Deep Dive button intelligently hides when the trivia notification appears at 95%+ video progress to avoid duplicate controls.
- **Movie Catalog**: 4 open-source Blender Foundation movies with comprehensive metadata including detailed synopses, directors, cast, taglines, studios, countries, languages, and awards. Movies hosted via mobile-compatible Google Cloud Storage: Big Buck Bunny (2008, Comedy, directed by Sacha Goedegebure), Sintel (2010, Fantasy, directed by Colin Levy), Tears of Steel (2012, Science Fiction, directed by Ian Hubert), and Elephants Dream (2006, Surreal, directed by Bassam Kurdali). All videos work reliably across desktop and mobile devices including iOS Safari. Movie player displays rich metadata including director, cast, studio, release year, country, language, and festival awards.
- **Crew Command Center (Private Rooms)**: Real-time room creation/joining with unique codes, live chat, and host controls, powered by Firebase Firestore. Firebase Anonymous Authentication is enabled and Firestore security rules are configured for production use. Features unified teal gradient aesthetics with gradient-bordered CTAs, teal-icon-glow host badges, and teal-accented chat messages for visual consistency with Deep Dive trivia. Hero section uses darkened teal gradient for optimal text visibility.
  - **Synchronized Video Playback** (Production Ready ✅): Host-controlled movie watching with real-time synchronization across all room members. Host selects a movie from the catalog, and all playback controls (play/pause/seek) automatically sync to every member's video player. Non-host members have controls disabled and their video state is defensively enforced to match the host's state every 100ms, preventing desynchronization. Room video state (movieId, isPlaying, currentTime, lastUpdated) is stored in Firebase Firestore for real-time propagation. Features teal gradient styling with "Now Watching" header and sync status indicator for members. Fully tested and verified working in production environment.
  - **Friends System & Quick Invite**: Integrated friend search and management within Private Rooms. Features a **Quick Invite** dropdown that allows users to search and instantly invite friends - automatically creating a crew room, adding both users, and sending a welcome message. When creating a crew call, users can also manually search for friends by name/email and view their top 10 most frequent collaborators, sorted by interaction count. Friend interactions are automatically tracked across room joins, messages, and games via dedicated API endpoints. PostgreSQL stores friendships and interaction metrics for persistent friend rankings with null-safe rendering. The FriendSearchDropdown component provides live search with profile pictures, real-time filtering, and one-click invite functionality.
- **Firebase Configuration** (Production Ready ✅): Firebase Anonymous Authentication enabled and Firestore security rules configured for krittics/multiplayer/rooms collection. Rules allow authenticated users to create/update rooms, read room data, send messages, and hosts to delete rooms. Smart error handling differentiates between missing secrets, auth disabled, and other errors with actionable user guidance.
- **Leaderboard System**: Real-time rankings with daily/weekly/all-time filtering and user highlighting, persisted in PostgreSQL.
- **Krittics Insights**: Comprehensive blog section with 8 in-depth articles exploring AVOD business strategy, interactive content economics, technology choices, and platform development. Articles cover: Interactive AVOD market dominance, Krossfire engagement economics, Firebase/Gemini/Node.js tech stack rationale, content licensing for startups, monetization metrics (ARPU, eCPM, LTV, Fill Rate), Firebase backend scaling best practices, beta testing methodologies, and mobile-first optimization strategies. Accessible via header navigation with teal gradient styling matching overall platform aesthetic.
- **API Endpoints**: Comprehensive set of RESTful APIs for movies, trivia generation, game sessions, leaderboards, and friend management (search, add, top friends).
- **CSS Gradient System**: Centralized teal gradient utilities using CSS custom properties (--teal, --teal-light, --teal-dark with RGB variants) for maintainable, reusable gradient effects. Includes 135° multi-stop gradient backgrounds and triple-layer glow effects for icons.
- **Production Teaser Overlay**: Semi-transparent "KRITTICS — LAUNCHING SOON" overlay displayed only in production (www.krittics.com) with 75% opacity dark background and pointer-events: none, allowing Google bots and crawlers to fully access all content while maintaining pre-launch privacy. Subtitle notes "(Full site visible to Google reviewers)" for transparency. Does not block scrolling, clicking, or content indexing.

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