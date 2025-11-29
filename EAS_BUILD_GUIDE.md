# EAS Build for Krittics - Simple iOS Deployment

This project uses **Expo Application Services (EAS)** for easy cloud-based iOS builds, while keeping your React web app unchanged.

## ✅ What's Configured

- ✅ EAS CLI installed
- ✅ `eas.json` configured for Capacitor iOS builds
- ✅ Automatic React build + Capacitor sync before each iOS build
- ✅ TestFlight submission ready

---

## 🚀 How to Build & Deploy (2 Commands!)

### First Time Setup

1. **Login to Expo:**
   ```bash
   npx eas login
   ```

2. **Initialize your project with EAS:**
   ```bash
   npx eas init
   ```
   This creates an EAS project and links it to your local repo.
   
3. **Configure your Apple credentials (one-time):**
   ```bash
   npx eas credentials
   ```
   - Select iOS
   - Choose "App Store Connect API Key"
   - Follow prompts to connect your Apple Developer account
   
   EAS will automatically manage your certificates and provisioning profiles in the cloud!

### Build for iOS

```bash
# Preview build (for testing on simulator)
npx eas build --platform ios --profile preview

# Production build (for TestFlight/App Store)
npx eas build --platform ios --profile production
```

### Submit to TestFlight

```bash
npx eas submit --platform ios --profile production
```

That's it! ✅

---

## 📋 What Each Command Does

| Command | What It Does |
|---------|--------------|
| `npx eas build --platform ios --profile preview` | Builds for iOS Simulator (testing) |
| `npx eas build --platform ios --profile production` | Builds App Store-ready IPA |
| `npx eas submit --platform ios` | Uploads to TestFlight automatically |

---

## 🔑 Required Secrets (One-Time Setup)

EAS needs these environment variables for submission:

1. Go to your Expo dashboard: https://expo.dev
2. Select your project
3. Go to **Secrets**
4. Add these:

| Secret Name | Description |
|-------------|-------------|
| `APPLE_ID_EMAIL` | Your Apple ID email |
| `ASC_APP_ID` | App Store Connect app ID (10-digit number) |

**Or** add them locally in `.env.local`:
```bash
APPLE_ID_EMAIL=your@email.com
ASC_APP_ID=1234567890
```

---

## 🎯 Complete Workflow Example

```bash
# 1. Login (first time only)
npx eas login

# 2. Initialize project (first time only)
npx eas init

# 3. Configure credentials (first time only)
npx eas credentials

# 4. Build for production
npx eas build --platform ios --profile production

# 5. Wait for build to complete (EAS will give you a link to monitor)

# 6. Submit to TestFlight
npx eas submit --platform ios --profile production

# Done! Check TestFlight in ~5 minutes
```

---

## 🔄 Build Workflow

When you run `npx eas build`, EAS automatically:

1. ✅ Runs `npm install`
2. ✅ Runs `npm run build` (builds your React app)
3. ✅ Runs `npx cap sync ios` (syncs to Capacitor)
4. ✅ Installs CocoaPods
5. ✅ Builds the iOS archive
6. ✅ Signs with your certificates
7. ✅ Uploads the IPA

**No Xcode required. No GitHub Actions. No manual configuration.**

---

## 🆚 EAS vs GitHub Actions

| Feature | GitHub Actions | EAS Build |
|---------|---------------|-----------|
| Setup complexity | High (workflows, secrets, runners) | Low (one config file) |
| Build command | Manual YAML configuration | `npx eas build` |
| Certificate management | Manual base64 encoding | Automatic |
| Cost | Free (with limits) | Free tier available |
| Build speed | ~15-20 min | ~10-15 min |
| TestFlight upload | Manual configuration | One command |

---

## 🐛 Troubleshooting

### "No credentials configured"
Run: `npx eas credentials` and follow the prompts to set up App Store Connect API key.

### "Project not initialized"
Run: `npx eas init` to link your project to EAS.

### "Build failed during pod install"
Check your `Podfile` in `ios/App/` - EAS uses it automatically.

### "Invalid provisioning profile"
EAS manages credentials remotely, but if you see this error, run `npx eas credentials` to reconfigure.

**Note:** This project uses `workflow: "generic"` in `eas.json`, which means EAS treats it as a Capacitor/React app (not a managed Expo app). The `prebuildCommand` automatically builds your React app and syncs with Capacitor before each iOS build.

---

## 📚 Next Steps

1. Run `npx eas login` to get started
2. Run `npx eas build --platform ios --profile production`
3. Watch the build complete in the cloud
4. Run `npx eas submit --platform ios`
5. Check TestFlight!

**No more GitHub Actions headaches. No more Xcode configuration. Just simple cloud builds.**
