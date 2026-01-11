# Building Release APK

Standard operating procedure for generating release APKs.

---

## Prerequisites

- Android Studio installed (for SDK and build tools)
- No emulators or Metro bundlers running (they lock build directories)

---

## Build Steps

### 1. Stop any running processes

Close Android Studio, emulators, and any terminals running Metro. If build directories are locked:

```powershell
Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
```

If `expo-constants` build is corrupted:
```powershell
Remove-Item -Recurse -Force "node_modules\expo-constants\android\build"
```

### 2. Build the APK

```powershell
cd N:\VibeDeck\android
.\gradlew.bat assembleRelease
```

Build output location:
```
N:\VibeDeck\android\app\build\outputs\apk\release\app-release.apk
```

### 3. Rename and copy to ReleaseFiles

Replace `X.X.X` with the version number (e.g., `1.0.1`):
check app.json for current version number. 

```powershell
cd N:\VibeDeck
Copy-Item "android\app\build\outputs\apk\release\app-release.apk" "ReleaseFiles\apk\VibeDeck_X.X.X.apk"
```

---

## Quick Reference (All-in-One)

```powershell
cd N:\VibeDeck\android
.\gradlew.bat assembleRelease
cd ..
Copy-Item "android\app\build\outputs\apk\release\app-release.apk" "ReleaseFiles\apk\VibeDeck_1.0.1.apk"
```

---

## Troubleshooting

### "Access denied" on build directories

A Gradle daemon or Metro bundler has file locks. Kill all Java/Node processes and try again.

### Build fails on `:expo-constants:createExpoConfig`

Remove the corrupted build cache:
```powershell
Remove-Item -Recurse -Force "node_modules\expo-constants\android\build"
```

### Emulator spawns unexpectedly

Use `.\gradlew.bat assembleRelease` directly instead of `npx expo run:android`.
