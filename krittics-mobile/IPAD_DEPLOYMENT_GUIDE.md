# iPad Deployment Guide - Krittics Mobile App

## 🚀 Quick Start (3 Steps)

### Step 1: Open Xcode on Your Mac
```bash
cd krittics-mobile
open ios/App/App.xcodeproj
```

### Step 2: Connect Your iPad
- Connect your iPad via USB-C or wirelessly
- Select your iPad as the target device in Xcode (top toolbar)
- Make sure your iPad is in Developer Mode (Settings > Privacy & Security > Developer Mode)

### Step 3: Run the App
- Click the **Play (▶️)** button in Xcode
- The app will build and install on your iPad
- Wait for it to launch automatically

---

## 🎬 Testing the Floating Chat Feature

### Option A: Auto-Demo Page (Recommended for Quick Testing)
1. **Navigate to the demo page:**
   - Open the app on your iPad
   - Navigate to: `/crew-demo` in the URL bar (or via routing)
   
2. **The friend picker will auto-open:**
   - Select 1 or more friends from the list
   - Tap "Start Crew Watch"
   
3. **Test the floating chat:**
   - Video starts playing Big Buck Bunny
   - Press **Play ▶️** on the video
   - **Floating chat appears at bottom-left corner**
   - Tap the input bar at bottom-left
   - Type a message and send
   - Watch it **float upward over 8 seconds** from bottom-left
   - Message fades out after 8-10 seconds total
   - Press **Pause ⏸** - chat disappears

### Option B: Manual Testing
1. Navigate to `/crew-watch?roomCode=TEST123&movieUrl=YOUR_VIDEO_URL`
2. Follow steps 3 from Option A above

---

## ✅ What You Should See

### Bottom-Left Positioning (Netflix/Rabbit Style)
- **Input bar:** 16px from left edge, 12px from bottom (above safe area)
- **Floating messages:** Rise from bottom-left, aligned to left side
- **Max width:** 320px for compact chat bubbles
- **Blur effects:** Maintained as before

### Animation Flow
```
Enter (instant) → Float upward 8s → Fade out 2s → Remove from DOM
```

### Chat Visibility
- ✅ Appears when video plays
- ✅ Hides when video pauses
- ✅ Hides when video ends
- ✅ Input bar stays above iOS keyboard

---

## 🎯 Friend Picker Modal

### Host-Only Manual Invites
- No auto-join or public room behavior
- Host taps "Start Crew Watch" → Friend picker opens
- **Real friend data** fetched from backend API (`/friends/top`, `/friends/search`)
- Select friends from list (with search)
- Only selected friends + host can join the room
- Private room enforcement via Firebase room creation

### Features
- **Real API Integration:** Loads actual friend suggestions from PostgreSQL backend
- **Live Search:** Filter friends by name or email with instant results
- **Multi-select:** Tap to toggle friend selection
- **Visual feedback:** Selected friends highlighted in teal
- **Selection count:** Shows "X friends selected" at bottom
- **Teal gradient styling:** Matches web app aesthetic
- **Loading states:** Spinner while fetching friends from API

---

## 🔧 Troubleshooting

### App Won't Install
- Check Developer Mode is enabled on iPad
- Verify code signing in Xcode (automatic signing recommended)
- Clean build folder: Product > Clean Build Folder in Xcode

### Floating Chat Not Showing
- Make sure you press **Play ▶️** on the video
- Check that you're on the crew-watch page with valid roomCode
- Open Safari Developer Console to check for errors

### Keyboard Issues
- The input bar uses Capacitor Keyboard API
- It automatically moves above keyboard when typing
- Safe area insets are respected on notched devices

### Firebase Not Working
- Update Firebase credentials in `environment.ts`
- Replace placeholder values with your actual Firebase config
- Make sure Firestore is enabled in Firebase Console

---

## 📝 Routes Available

```
/tabs/home       → DEFAULT - Main home page with "Start Crew Watch" button
/crew-demo       → Auto-demo with friend picker (testing only)
/crew-watch      → Main Crew watch page (requires roomCode query param)
/interests       → User interests selection
```

### New in This Build
- **HomePage as Default:** App now opens to `/tabs/home` with integrated Crew Watch launcher
- **Real Friend Data:** Friend picker fetches actual friends from backend API
- **Private Room Creation:** FirebaseService creates rooms with invitedUsers list for access control
- **Bottom Navigation:** Home, Browse, and Profile tabs

---

## 🎨 Design Specifications

### Input Bar
- Height: 56px
- Background: `rgba(0, 0, 0, 0.85)` with 20px blur
- Border radius: 28px (fully rounded)
- Position: `left: 16px`, `bottom: 12px`
- Max width: 400px
- Safe area: `padding-bottom: env(safe-area-inset-bottom)`

### Message Bubbles
- Max width: 320px
- Background: `rgba(0, 0, 0, 0.45)` with 10px blur
- Border radius: 16px
- Padding: 12px 16px
- Position: `left: 16px`, rises from `bottom: 80px`

### Colors
- Teal accent: `#1ba9af`
- Username: Teal with 90% opacity
- Message text: White
- Blur overlays: Black with varying opacity

---

## 🚢 Ready to Ship!

All features are production-ready:
- ✅ Friend picker modal with manual invite selection
- ✅ Bottom-left floating chat positioning
- ✅ 8-second continuous float animation
- ✅ iOS safe area handling
- ✅ Keyboard avoidance
- ✅ Blur effects with webkit prefixes
- ✅ Auto-demo page for immediate testing
- ✅ Teal gradient branding throughout

**Enjoy testing! 🎬✨**
