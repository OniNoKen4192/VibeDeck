# VibeDeck

A tag-based, button-board audio player for managing music and sounds at sporting events. Built for parents who want to offload mental stress and make the task fun.

**Target Platform:** Android

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) — [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** — [git-scm.com](https://git-scm.com/)

For running on a device or emulator:

- **Android Studio** — Required for Android SDK and emulator
  - Install Android SDK (API 34 recommended)
  - Configure `ANDROID_HOME` environment variable
- **Physical Android device** — Enable USB debugging in Developer Options

Alternatively, use **Expo Go** app on your phone for quick testing (limited native feature support).

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd VibeDeck
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
```

This launches the Expo dev server. You'll see a QR code and menu options.

### 4. Run on a Device or Emulator

**Android Emulator:**
```bash
npm run android
```

**Physical Device via Expo Go:**
1. Install "Expo Go" from Play Store
2. Scan the QR code from the terminal

**Physical Device via USB (development build):**
```bash
npx expo run:android
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Start on Android emulator |
| `npm run ios` | Start on iOS simulator (macOS only) |
| `npm run web` | Start in web browser |
| `npm run lint` | Run ESLint on TypeScript files |
| `npm run lint:fix` | Run ESLint and auto-fix issues |
| `npm run format` | Format code with Prettier |

---

## Project Structure

```
VibeDeck/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigation (Board, Library, Tags)
│   └── _layout.tsx         # Root layout
├── src/
│   ├── components/         # Reusable UI components
│   ├── stores/             # Zustand state management
│   ├── db/                 # SQLite database layer
│   ├── services/           # Business logic (import, playback)
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── constants/          # App constants (colors, layout)
├── docs/                   # Project documentation
└── council/                # Dragon council agent files
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router |
| State | Zustand |
| Database | SQLite (expo-sqlite) |
| Audio | react-native-track-player |
| File System | expo-file-system |

---

## Code Quality

The project uses ESLint and Prettier for code quality:

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint:fix

# Format all files
npm run format
```

TypeScript strict mode is enabled via `tsconfig.json`.

---

## Privacy Constraint

**VibeDeck is fully offline.** No data ever leaves the device.

- No network calls
- No analytics or telemetry
- No cloud storage
- No third-party SDKs that phone home

This is an architectural constraint, not a guideline. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | AI assistant instructions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/DATAMODEL.md](docs/DATAMODEL.md) | Database schema |
| [docs/MVP_SPEC.md](docs/MVP_SPEC.md) | Feature specification |
| [docs/UI_DESIGN.md](docs/UI_DESIGN.md) | UI component design |
| [council/COUNCIL.md](council/COUNCIL.md) | Dragon agent definitions |

---

## Troubleshooting

### "Unable to resolve module" errors
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Android build fails
Ensure Android SDK is installed and `ANDROID_HOME` is set:
```bash
# Windows (PowerShell)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# macOS/Linux
export ANDROID_HOME=$HOME/Android/Sdk
```

### Expo Go doesn't support native modules
Some features require a development build. Run:
```bash
npx expo run:android
```

---

## License

Private project. All rights reserved.
