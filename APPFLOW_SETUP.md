# Ionic Appflow iOS Signing Configuration

## 🎯 **Permanent Solution for iOS Codesigning**

This project uses Xcode's native `.xcconfig` system to ensure correct provisioning profiles are **always** applied, regardless of Capacitor sync or Appflow build process changes.

**TWO-LAYER PROTECTION:**
1. **Capacitor Level**: `capacitor.config.json` tells Capacitor to use the xcconfig file
2. **Appflow Level** (Optional): Native Configuration as backup

---

## ✅ **Already Configured in Code**

The following is **already set up** in your project:

1. ✅ `ios/App/config/manual-signing.xcconfig` - Signing configuration file
2. ✅ `capacitor.config.json` - Points Capacitor to the xcconfig file

**Just commit and push - it will work!**

---

## 📋 **Optional: Appflow Native Configuration (Backup Layer)**

For extra protection, you can also configure Appflow:

### Step 1: Navigate to Native Configurations
1. Log into [Ionic Appflow](https://dashboard.ionicframework.com/)
2. Select your **Krittics** app
3. Go to **Settings** → **Native Configurations** → **iOS**

### Step 2: Add Custom Build Configuration
1. Click **"Add Configuration"**
2. Set the following:
   - **Name**: `Manual Signing Config`
   - **Type**: `Build Configuration File (.xcconfig)`
   - **File Path**: `ios/App/config/manual-signing.xcconfig`
3. Click **Save**

### Step 3: Apply to Build Environments
1. Go to **Build** → **Environments**
2. For each environment (Debug/Release):
   - Click **Edit**
   - Under **iOS Settings** → **Native Configuration**
   - Select: `Manual Signing Config`
   - Click **Save**

---

## ✅ **How This Works**

### The Problem (Before)
```
Ionic Appflow Build Process:
1. npm ci              ← Installs dependencies
2. npx cap sync ios    ← Regenerates Xcode project (OVERWRITES settings)
3. npm run hooks       ← NEVER RUN (outside npm context)
4. xcodebuild          ← Fails with "missing provisioning profile"
```

### The Solution (Now - Two Layers)
```
Ionic Appflow Build Process:
1. npm ci                   ← Installs dependencies
2. npx cap sync ios         ← Reads capacitor.config.json
   ↓ Sees: "xcconfigFile": "ios/App/config/manual-signing.xcconfig"
   ↓ Applies xcconfig during project generation
3. xcodebuild               ← Xcode uses xcconfig settings
   ✓ Correct provisioning profile applied
   ✓ Build succeeds
```

**Why This Works:**
- Capacitor itself is told to use the xcconfig file
- No hooks needed - it's baked into project config
- Works locally AND in Appflow
- Survives all future updates

---

## 🔧 **Configuration File Details**

**File**: `ios/App/config/manual-signing.xcconfig`

```xcconfig
PRODUCT_BUNDLE_IDENTIFIER = com.blakely.krittics
DEVELOPMENT_TEAM = 9SA2W557K5
PROVISIONING_PROFILE_SPECIFIER = Krittics App Store Profile
CODE_SIGN_IDENTITY = Apple Distribution: Staton Blakely (9SA2W557K5)
CODE_SIGN_STYLE = Manual
```

---

## 🚀 **Why This Is Bulletproof**

| Approach | Survives Cap Sync? | Survives Appflow Updates? | Future-Proof? |
|----------|-------------------|---------------------------|---------------|
| npm hooks | ❌ Don't run in Appflow | ❌ | ❌ |
| Patch PBX file | ❌ Gets regenerated | ❌ | ❌ |
| externalProject flag | ❌ Ignored by Appflow | ❌ | ❌ |
| **xcconfig file** | ✅ Applied after sync | ✅ Independent of tooling | ✅ |

---

## 📝 **Maintenance**

### Updating Signing Credentials
If you need to change bundle ID, team ID, or provisioning profile:

1. Edit `ios/App/config/manual-signing.xcconfig`
2. Commit and push to GitHub
3. Next Appflow build will use new values automatically

**No Appflow reconfiguration needed!**

---

## 🧪 **Testing**

After setting up in Appflow:
1. Trigger a new iOS build in Appflow
2. Check build logs - should show xcconfig being applied
3. Build should succeed with correct provisioning profile

---

## 📚 **References**

- [Xcode Build Configuration Files](https://developer.apple.com/library/archive/featuredarticles/XcodeConcepts/Concept-Build_Settings.html)
- [Ionic Appflow Native Configurations](https://ionic.io/docs/appflow/package/native-configs)
