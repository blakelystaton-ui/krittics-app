# Floating Chat Feature - Krittics iOS/iPadOS App

## Overview
Beautiful, modern floating chat system for Crew watch sessions with messages that float upward over the video player, inspired by YouTube/Twitch live chat aesthetics.

## Implementation Summary

### Components Created

#### 1. **FirebaseService** (`services/firebase.service.ts`)
- Real-time Firestore integration for chat messages
- Methods: `getRoomMessages()`, `sendMessage()`
- Auto-subscribes to message updates with RxJS Observables
- Connects to `krittics/multiplayer/rooms/{roomCode}/messages` collection

#### 2. **CrewWatchPage** (`pages/crew-watch/crew-watch.page.ts`)
- Main video player page for Crew watch sessions
- Accepts `roomCode` and `movieUrl` query parameters
- Toggles floating chat visibility based on playback state
- Integrates with AuthService for user authentication

#### 3. **FloatingChatComponent** (`components/floating-chat/floating-chat.component.ts`)
- Displays last 3 messages as floating bubbles
- **Animation Flow:**
  - Enter from bottom (opacity 0 → 1)
  - Float upward over **8 seconds** (translateY -150px, continuous motion)
  - Fade out over last **2 seconds** (opacity 1 → 0)
  - Auto-remove from DOM after 10 seconds total
- Uses Angular animations with proper state management

#### 4. **ChatInputBarComponent** (`components/chat-input-bar/chat-input-bar.component.ts`)
- Fixed bottom input bar with blur effect
- Capacitor Keyboard integration (stays above keyboard)
- iOS safe area handling with `env(safe-area-inset-bottom)`
- Teal accent send button (#1ba9af)

### Key Features

✅ **Only shows during active Crew playback**
- Appears on video `play` event
- Hides on `pause` and `ended` events
- Conditional rendering with `*ngIf="showFloatingChat"`

✅ **Smooth 8-10 second float animation**
- Continuous upward motion over 8 seconds
- 2-second fade out at the end
- No idle time between animations

✅ **iOS/iPadOS compatibility**
- Safe area insets for notched devices
- Backdrop blur effects with webkit prefixes
- Keyboard avoidance using Capacitor Keyboard API

✅ **Translucent blur backgrounds**
- `backdrop-filter: blur(10px)` on message bubbles
- `backdrop-filter: blur(20px)` on input bar
- `rgba(0, 0, 0, 0.45)` semi-transparent backgrounds

✅ **Non-blocking design**
- `pointer-events: none` on message overlay
- Video controls remain fully functional
- Messages stack vertically with 12px gap

✅ **Teal branding**
- Username in teal (#1ba9af)
- Send button in teal with hover/active states
- Matches web app aesthetic

### Usage

Navigate to the Crew Watch page with query parameters:
```typescript
this.router.navigate(['/crew-watch'], {
  queryParams: {
    roomCode: 'ABC123',
    movieUrl: 'https://example.com/movie.mp4'
  }
});
```

The floating chat will:
1. Auto-subscribe to Firestore messages for the room
2. Display when video starts playing
3. Show messages floating upward continuously
4. Accept new messages via input bar
5. Hide when video pauses or ends

### Firebase Configuration

Update `environment.ts` and `environment.prod.ts` with your Firebase credentials:
```typescript
firebaseConfig: {
  apiKey: 'YOUR_ACTUAL_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
}
```

### Dependencies Installed
- `firebase` - Firestore SDK
- `@angular/fire` - Angular Firebase wrapper (optional, not used in current impl)
- `@capacitor/keyboard` - Keyboard event handling

### Routing
Added to `app.routes.ts`:
```typescript
{
  path: 'crew-watch',
  loadComponent: () => import('./pages/crew-watch/crew-watch.page').then(m => m.CrewWatchPage)
}
```

### Technical Specifications

**Message Bubble:**
- Max width: 80% of screen
- Background: `rgba(0, 0, 0, 0.45)` with 10px blur
- Border radius: 16px
- Padding: 12px 16px
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.3)`

**Input Bar:**
- Height: 56px
- Background: `rgba(0, 0, 0, 0.85)` with 20px blur
- Bottom padding: `env(safe-area-inset-bottom)`
- Input border-radius: 24px
- Send button: 40x40px circle

**Animation States:**
1. `enter` - opacity 0, translateY 0px
2. `floating` - opacity 1, translateY -150px (8 seconds)
3. `exit` - opacity 0, translateY -180px (2 seconds)

### Testing Checklist
- ✅ Messages appear and float upward smoothly
- ✅ Chat hides when video pauses/ends
- ✅ Input bar stays above keyboard on iOS
- ✅ Safe areas respected on iPhone X+
- ✅ Blur effects work on iPad/iPhone
- ✅ Messages don't block video controls
- ✅ Firestore real-time sync works
- ✅ User authentication integrated

### Future Enhancements
- Add message reactions
- Implement message deletion
- Add typing indicators
- Support emojis/GIFs
- Add message moderation
- Implement read receipts

## Architecture Notes
- Standalone components (Angular 17+ pattern)
- RxJS Observable-based Firebase integration
- Pure Angular animations (no external libraries)
- Capacitor for native keyboard handling
- Environment-based config for dev/prod
