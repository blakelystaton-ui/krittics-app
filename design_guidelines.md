# Krittics Platform Design Guidelines

## Design Approach

**Reference-Based Approach:** Drawing inspiration from Netflix's immersive streaming experience, Disney+'s polished playback interface, and Kahoot's energetic trivia game aesthetics. The design emphasizes entertainment value while maintaining functional clarity for both passive viewing and active gameplay.

**Core Principles:**
- Cinematic immersion: Content-first design that puts movies and gameplay center stage
- Competitive energy: Dynamic visual hierarchy that builds excitement during trivia challenges
- Seamless transitions: Smooth flow between watching, playing, and competing modes
- Gaming sensibility: Immediate visual feedback, clear score displays, and celebratory moments

---

## Typography System

**Font Families:**
- Primary: Inter (Google Fonts) - Clean, modern sans-serif for UI elements, body text, and navigation
- Display: Outfit (Google Fonts) - Bold, impactful for headings, scores, and game states

**Hierarchy:**
- Hero/Main Titles: Outfit, 3xl-4xl (48-56px desktop, 32-40px mobile), extrabold weight
- Section Headers: Outfit, 2xl-3xl (32-40px desktop, 24-32px mobile), bold weight
- Question Text: Inter, xl-2xl (20-28px), semibold weight
- Body/Options: Inter, base-lg (16-18px), medium weight
- Metadata/Scores: Inter, sm-base (14-16px), regular weight
- Micro-copy: Inter, xs-sm (12-14px), regular weight

---

## Layout System

**Spacing Primitives:**
Core spacing units: **2, 4, 8, 12, 16, 20** (Tailwind units)
- Micro spacing (2, 4): Button padding, icon gaps, tight element grouping
- Standard spacing (8, 12): Component internal padding, card spacing
- Section spacing (16, 20): Between major UI sections, page margins

**Grid Structure:**
- Maximum content width: max-w-7xl (1280px) for main content
- Video player: max-w-6xl (1152px) for 16:9 cinematic viewing
- Trivia questions: max-w-4xl (896px) for focused reading
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

**Page Layouts:**
- Movie Player: Full-width video container, controls overlay, side panel for trivia trigger (desktop)
- Trivia Game: Centered card-based layout, full viewport height utilization with vertical centering
- Krossfire Mode: Split-screen competitive view (desktop), stacked rounds (mobile)

---

## Component Library

### Navigation & Header
- Fixed top navigation bar with platform branding (left), mode switcher (center), user ID display (right)
- Subtle underline indicator for active page state
- Mobile: Hamburger menu collapse below md breakpoint

### Video Player Interface
- 16:9 aspect ratio container with responsive scaling
- Custom playback controls: play/pause, timeline scrubber, volume, fullscreen
- Progress tracking: Visual bar showing movie completion percentage
- Minimal overlay controls that fade on inactivity
- "Deep Dive Ready" notification badge appears at 95% completion

### Trivia Game Components

**Question Cards:**
- Elevated card design with pronounced shadow
- Question number indicator (1/5, 2/5, etc.) in top corner
- Question text prominently displayed with generous padding (p-8)
- Four answer option buttons in 2x2 grid (desktop) or stacked (mobile)
- Each option button: Full-width, left-aligned text, rounded corners, hover/selected states
- Immediate visual feedback: Correct answers highlight in success tone, incorrect in error tone
- 1.5s pause with animated transition before next question

**Score Display:**
- Persistent score counter during gameplay
- Final score screen: Large percentage display, celebratory messaging based on performance
- Tier messaging: "Perfect Score!" (100%), "Expert Critic!" (80-99%), "Movie Buff" (60-79%), "Keep Watching" (<60%)

**Game States:**
- Initial state: Hero-style invitation with "Start Trivia" CTA button
- Loading state: Animated pulse effect with generation status message
- Playing state: Question cards with progress indicator
- Finished state: Results screen with score, replay button, share functionality

### Krossfire Competitive Mode
- Real-time opponent display with avatar placeholders
- Question countdown timer with animated circular progress
- Live leaderboard sidebar showing all players and current scores
- Streak indicators for consecutive correct answers
- Winner celebration screen with podium-style ranking

### Supporting Components
- Toast notifications for errors, achievements, and game events
- Modal dialogs for game rules, settings, and multiplayer lobby
- Loading skeletons for content that's being fetched
- Empty states with encouraging copy and CTAs to start playing

---

## Imagery & Media

**Hero Image:**
Yes - The Movie Player page features a large hero image showcasing the current/featured film with gradient overlay for text readability.

**Image Placements:**
- Movie Player Hero: Full-width cinematic poster/backdrop (1920x1080) with 40% gradient overlay from bottom, contains movie title and "Watch Now" CTA with blurred background button treatment
- Trivia Game Background: Subtle film-related imagery (dimmed, 20% opacity) behind question cards for thematic immersion
- Krossfire Lobby: Dynamic montage of movie scenes as animated background
- Profile/Avatar: User-generated or default avatar circles throughout multiplayer features

**Image Treatment:**
- All hero buttons use backdrop-blur-md for glass-morphism effect
- Poster images have subtle border-radius (8-12px) for polish
- Loading states show blurred placeholder thumbnails

---

## Interactive Elements

**Buttons:**
- Primary CTAs: Large (px-8 py-4), bold text, prominent styling for main actions (Start Trivia, Play Movie)
- Secondary actions: Medium size (px-6 py-3), outlined style for less critical options
- Tertiary/Ghost: Minimal styling (px-4 py-2) for navigational or subtle actions
- All buttons include hover scale transform (scale-105) and smooth transitions
- Buttons over images: backdrop-blur-md background, semi-transparent treatment

**Answer Options (Trivia):**
- Default: Neutral background, clear border, left-aligned text with icon space
- Hover: Slight elevation, subtle background shift
- Selected: Border emphasis, visual lock-in before reveal
- Correct: Success treatment with checkmark icon animation
- Incorrect: Error treatment with X icon, brief shake animation

**Progress Indicators:**
- Video timeline: Draggable scrubber with preview thumbnail on hover
- Trivia progress: Step indicator showing X/5 questions with filled/unfilled dots
- Loading: Animated shimmer effect or pulsing elements

---

## Animation Guidelines

**Use Sparingly - Strategic Moments Only:**
- Question transitions: Smooth slide-out/slide-in (300ms ease-in-out)
- Answer reveal: Staggered fade-in for correct/incorrect state (150ms delay)
- Score celebrations: Confetti burst or number count-up animation (1s duration)
- Modal appearances: Fade + scale from center (250ms)
- Avoid: Constant micro-animations, hover effects that distract from content

---

## Responsive Behavior

**Desktop (lg+):**
- Side-by-side layouts for video + trivia panel
- 2x2 answer grid for trivia questions
- Full navigation with all labels visible

**Tablet (md):**
- Stacked video and trivia sections
- 2x2 answer grid maintained
- Condensed navigation labels

**Mobile (base):**
- Single column, full-width video
- Stacked answer options (1 column)
- Hamburger menu navigation
- Score overlays instead of sidebars
- Touch-optimized button sizes (min 44x44px)

---

**Deliverable Focus:** Create a visually striking, feature-complete platform that balances cinematic viewing with competitive gaming energy. Every interaction should feel intentional, rewarding, and polished to production standards.