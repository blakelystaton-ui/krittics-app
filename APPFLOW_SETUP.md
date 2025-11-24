# Ionic Appflow iOS Signing Configuration

## 🎯 **Permanent Solution for iOS Codesigning**

This project uses Xcode's native `.xcconfig` system to ensure correct provisioning profiles are **always** applied, regardless of Capacitor sync or Appflow build process changes.

---

## 📋 **One-Time Appflow Setup (Required)**

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
3. npm run capacitor:sync:after  ← Hook NEVER RUNS (outside npm context)
4. xcodebuild          ← Fails with "missing provisioning profile"
```

### The Solution (Now)
```
Ionic Appflow Build Process:
1. npm ci              ← Installs dependencies
2. npx cap sync ios    ← Regenerates Xcode project (still overwrites)
3. xcodebuild -xcconfig ios/App/config/manual-signing.xcconfig
   ↑ Xcode reads our config file AFTER regeneration
   ✓ Correct provisioning profile applied
   ✓ Build succeeds
```

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
