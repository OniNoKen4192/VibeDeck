# Vaelthrix Handoff: Architecture Conflict Resolution

> **Priority:** BLOCKING — Development build cannot compile
> **Created:** 2026-01-08
> **Context:** Dependency conflict prevents Android build

---

## Problem Statement

VibeDeck has two native dependencies with **mutually exclusive architecture requirements**:

| Dependency | Requires New Architecture | Reason |
|------------|---------------------------|--------|
| `react-native-track-player` | **NO** | Not yet updated for TurboModules |
| `react-native-worklets` | **YES** | Explicitly enforces via Gradle check |

When `newArchEnabled: false` (required for track-player), the build fails:
```
Execution failed for task ':react-native-worklets:assertNewArchitectureEnabledTask'.
> [Worklets] Worklets require new architecture to be enabled.
```

When `newArchEnabled: true` (required for worklets), the app crashes at runtime:
```
ERROR: TurboModuleRegistry.getEnforcing(...): 'TrackPlayerModule' could not be found.
```

---

## Current Dependency Chain

```
react-native-reanimated@4.1.1
  └── react-native-worklets@0.5.1 (peer dependency, requires New Arch)

react-native-track-player@4.1.2 (requires Old Arch / Bridge)
```

The `react-native-reanimated` import exists in `app/_layout.tsx` line 7:
```typescript
import 'react-native-reanimated';
```

This is a boilerplate side-effect import from Expo Router templates. **No actual Reanimated features are used in VibeDeck** (no `useAnimatedStyle`, `useSharedValue`, `withSpring`, etc.).

---

## Questions for Vaelthrix

1. **Can we remove `react-native-reanimated` and `react-native-worklets`?**
   - VibeDeck doesn't use advanced animations
   - Drag-reorder for buttons is a future feature, not MVP
   - Standard React Native `Animated` API would suffice for basic needs

2. **If we keep Reanimated, is there a compatible version combo?**
   - Older Reanimated versions didn't require worklets
   - Would need to find versions compatible with Expo SDK 54

3. **Alternative audio libraries?**
   - `expo-av` works with New Architecture but lacks features (no lock screen controls, limited background support)
   - Are there other options worth evaluating?

4. **Should we wait for track-player New Architecture support?**
   - Their GitHub shows active development
   - Timeline unknown

---

## Tarnoth's Recommendation

**Remove `react-native-reanimated` and `react-native-worklets` for MVP.**

Rationale:
- Audio playback is core functionality; animations are not
- We're not using any Reanimated features
- Simplifies the dependency tree
- Can add back post-MVP when track-player supports New Arch

If Vaelthrix concurs, the fix is:
1. Remove the import from `app/_layout.tsx`
2. Uninstall packages: `npm uninstall react-native-reanimated react-native-worklets`
3. Delete `android/` folder and rebuild

---

## Files Involved

- `app/_layout.tsx` — Contains unused Reanimated import
- `package.json` — Dependency declarations
- `app.json` — `newArchEnabled` setting (currently `false`)

---

## Related Documents

- [TARNOTH_HANDOFF.md](TARNOTH_HANDOFF.md) — Original dev build setup instructions
- [MVP_SPEC.md](../docs/MVP_SPEC.md) — New Architecture listed as post-MVP
- [StretchGoals.md](../docs/StretchGoals.md) — New Architecture added as stretch goal #11
