# Krittics - AI-Powered Movie Trivia Platform

## Overview
Krittics is an immersive movie trivia platform that combines cinematic experiences with AI-powered trivia challenges. It features a single-player Deep Dive mode, multiplayer Private Rooms with live chat, and competitive Krossfire leaderboards. The platform showcases 4 open-source Blender Foundation movies with mobile-compatible video hosting from Google Cloud Storage, providing a Netflix-style browsing experience for movie discovery alongside engaging trivia. Its purpose is to deliver a production-ready React/TypeScript web application with an Express backend, and an Ionic/Angular mobile companion app (in development) that connects to the same Express API.

## User Preferences
- Primary theme: Dark mode only (locked, no theme toggle)
- Color scheme: Unified teal accent (#1ba9af) with gradient border aesthetic throughout
- Typography: Outfit (display headings), Inter (body text)
- Visual style: Content-first design, smooth transitions, subtle elevations, teal gradient aesthetics

## System Architecture
The application is built with a **React 18** frontend (Vite, Tailwind CSS, shadcn/ui) and an **Express.js** backend (TypeScript). Data persistence uses **PostgreSQL via Neon HTTP driver** with **Drizzle ORM** for core application data and **Firebase Firestore** for real-time multiplayer features. **Google Gemini 2.5 Flash** (via Replit AI Integrations) is used for AI-powered trivia generation. **TanStack Query v5** manages frontend data fetching, and **Wouter** handles client-side routing.

### Database Driver
- Uses **neon-http driver** for Replit compatibility, which does not support transactions.

### UI/UX Decisions
- **Netflix-style Browse Page**: Features an auto-rotating hero carousel, dynamic color theming, horizontal scrolling content rows, and movie cards with hover effects.
- **Queue Page**: Personal watchlist for managing movies, featuring a teal gradient hero section.
- **Dynamic Color Theming**: Movies influence the UI's accent colors with smooth transitions.
- **Responsive Design**: Mobile-first approach with smooth momentum scrolling.
- **Header Navigation**: Browse, Krossfire, Mission, and hamburger menu for additional options. Search icon opens a dialog with intelligent search history.
- **Search Dialog**: Full Krittics aesthetic with dark gradient background, teal gradient title text, and teal-accented borders. Features intelligent search history that persists the last 5 searched movies.
- **Continue Watching & Start from Beginning**: Cross-platform compatible progress restoration system for video playback.

### Technical Implementations
- **Authentication**: Utilizes Replit Auth as an OpenID Connect provider with PostgreSQL for session management.
- **Onboarding & Interests**: New users select interests, stored in PostgreSQL, for crew matching and ad targeting.
- **Interest-Based Ad Targeting**: Maps user interests to ad keywords for Google Ad Manager integration with various targeting modes.
- **Quick Match Matchmaking**: Intelligent 1-3 player matchmaking with interest-based prioritization, using a 15-second queue in PostgreSQL.
- **Crew Matching**: Finds users with shared interests using PostgreSQL array overlap queries.
- **Deep Dive Trivia**: AI-generated trivia with 5 unique questions per game, providing immediate visual feedback.
  - **Trivia Question Pool System**: Prevents duplicate questions for users across sessions using SHA-256 hash deduplication and user history tracking in PostgreSQL.
- **Movie Catalog**: 4 open-source Blender Foundation movies with comprehensive metadata, hosted via Google Cloud Storage.
- **Netflix/Hulu/Tubi-Style Linear Video Ads**: Seamless in-player video advertising powered by Google IMA SDK with VMAP-based ad scheduling.
- **Crew Command Center (Private Rooms)**: Real-time room creation/joining, live chat, and host controls, powered by Firebase Firestore.
  - **Synchronized Video Playback**: Host-controlled movie watching with real-time synchronization across all room members.
  - **Friends System & Quick Invite**: Integrated friend search and management within Private Rooms, allowing quick invites and tracking interactions in PostgreSQL.
  - **In-Room Member Invitation**: Host-only functionality for inviting friends to active rooms with intelligent suggestions.
- **Firebase Configuration**: Firebase Anonymous Authentication and Firestore security rules configured for multiplayer features.
- **Leaderboard System**: Real-time rankings with daily/weekly/all-time filtering, persisted in PostgreSQL.
- **Krittics Insights**: Blog section with articles on business strategy, technology, and platform development.
- **API Endpoints**: Comprehensive RESTful APIs for core functionalities.
- **CSS Gradient System**: Centralized teal gradient utilities using CSS custom properties for consistent branding.
- **Production Teaser Overlay**: Semi-transparent "KRITTICS — LAUNCHING SOON" overlay for production environment.

### System Design Choices
- **Hybrid Storage**: PostgreSQL for structured data and Firebase Firestore for real-time data.
- **AI Integration**: Gemini 2.5 Flash for structured JSON output trivia questions.
- **Graceful Degradation**: Multiplayer features designed with fallback mechanisms.
- **Smart Error Handling**: Differentiates Firebase errors for user guidance.

## External Dependencies
- **Replit Auth**: For user authentication.
- **Google Gemini 2.5 Flash**: For AI-powered trivia generation.
- **Firebase Firestore**: For real-time multiplayer functionality.
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: For PostgreSQL interaction.
- **Tailwind CSS**: For styling.
- **shadcn/ui**: For UI components.
- **TanStack Query v5**: For data fetching and state management.
- **Wouter**: For client-side routing.