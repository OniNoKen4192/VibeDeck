# Handoff: Per-Track Volume

**From:** Vaelthrix the Astral
**To:** Pyrrhaxis the Ember
**Date:** 2026-01-11
**Related Quest:** 1.1.0 Feature — Per-track volume

---

## Context

Users want to normalize volume across tracks. Some audio files are recorded louder than others, causing jarring volume jumps during a game. Per-track volume lets users set a relative volume adjustment so all tracks play at consistent perceived loudness.

## Design

### Data Model

Add one nullable field to the Track type:

```typescript
// src/types/index.ts
export interface Track {
  // ... existing fields
  volumeAdjust: number | null;  // -50 to +50 adjustment (null = 0, no adjustment)
}
```

**Semantics:**
- `null` or `0` = no adjustment (play at master volume)
- `-50` = reduce by 50% (very quiet)
- `+50` = boost by 50% (louder)
- Final volume = `masterVolume * (1 + volumeAdjust/100)`
- Clamped to 0-100 before applying to player

**Example:**
- Master volume: 80
- Track volumeAdjust: -25
- Effective volume: 80 * (1 + (-25/100)) = 80 * 0.75 = 60

---

## Implementation

### 1. Database Migration

**File:** `src/db/schema.ts`

Increment `SCHEMA_VERSION` to 3 and add migration:

```typescript
export const SCHEMA_VERSION = 3;

// Add to CREATE_TABLES_SQL (for fresh installs):
// In the tracks table, after end_time_ms:
//   volume_adjust INTEGER,

// Add new migration:
export const MIGRATION_V3 = `
  ALTER TABLE tracks ADD COLUMN volume_adjust INTEGER;
`;
```

**File:** `src/db/init.ts`

Add migration logic:

```typescript
import { MIGRATION_V2, MIGRATION_V3 } from './schema';

// In initDatabase(), add:
if (currentVersion < 3) {
  await db.execAsync(MIGRATION_V3);
}
```

### 2. Update Track Queries

**File:** `src/db/queries/tracks.ts`

Update `TrackRow` interface:
```typescript
interface TrackRow {
  // ... existing
  volume_adjust: number | null;
}
```

Update `rowToTrack`:
```typescript
function rowToTrack(row: TrackRow): Track {
  return {
    // ... existing
    volumeAdjust: row.volume_adjust,
  };
}
```

Update `insertTrack` to include new field.

Update `updateTrack` to handle new field:
```typescript
if (updates.volumeAdjust !== undefined) {
  fields.push('volume_adjust = ?');
  values.push(updates.volumeAdjust);
}
```

### 3. Update Types

**File:** `src/types/index.ts`

```typescript
export interface Track {
  // ... existing
  volumeAdjust: number | null;
}
```

### 4. Player Integration

**File:** `src/services/player/index.ts`

Add a helper to calculate effective volume:

```typescript
/**
 * Calculate effective volume considering track adjustment.
 * @param masterVolume - Global volume 0-100
 * @param trackAdjust - Per-track adjustment -50 to +50 (null = 0)
 * @returns Effective volume 0-100
 */
function calculateEffectiveVolume(masterVolume: number, trackAdjust: number | null): number {
  const adjust = trackAdjust ?? 0;
  const multiplier = 1 + (adjust / 100);
  const effective = masterVolume * multiplier;
  return Math.max(0, Math.min(100, effective));
}
```

Modify `playTrack` to apply track volume after starting:

```typescript
export async function playTrack(track: Track, masterVolume?: number): Promise<PlaybackResult> {
  // ... existing validation and setup ...

  // After TrackPlayer.play():

  // Apply track-specific volume if adjustment exists
  if (track.volumeAdjust !== null && track.volumeAdjust !== 0 && masterVolume !== undefined) {
    const effectiveVolume = calculateEffectiveVolume(masterVolume, track.volumeAdjust);
    await setVolume(effectiveVolume);
  }

  return { success: true };
}
```

**Alternative approach:** Pass master volume from BoardScreen when calling playTrack, or access it via store.

### 5. Volume Restoration on Track Change

When a track with volume adjustment ends and another starts (or playback stops), restore master volume. In the playback event handlers or in `stop()`:

```typescript
// When stopping or switching tracks, restore master volume
const masterVolume = usePlayerStore.getState().volume;
await setVolume(masterVolume);
```

### 6. UI: Volume Slider in TrackDetailModal

**File:** `src/components/modals/TrackDetailModal.tsx`

Add a new section after Cue Points:

```tsx
{/* Volume Adjustment section */}
<View style={styles.divider} />
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Volume Adjustment</Text>
  <VolumeAdjustSlider
    value={track.volumeAdjust}
    onChange={(value) => onUpdateVolume(track.id, value)}
  />
</View>
```

### 7. VolumeAdjustSlider Component

Create: `src/components/modals/VolumeAdjustSlider.tsx`

```tsx
/**
 * @file components/modals/VolumeAdjustSlider.tsx
 * @description Slider for per-track volume adjustment (-50 to +50).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

interface VolumeAdjustSliderProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export function VolumeAdjustSlider({ value, onChange }: VolumeAdjustSliderProps) {
  const displayValue = value ?? 0;
  const label = displayValue === 0
    ? 'Normal'
    : displayValue > 0
      ? `+${displayValue}%`
      : `${displayValue}%`;

  const handleChange = (newValue: number) => {
    // Round to nearest 5 for easier adjustment
    const rounded = Math.round(newValue / 5) * 5;
    // Treat 0 as null (no adjustment)
    onChange(rounded === 0 ? null : rounded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Quieter</Text>
        <Text style={styles.value}>{label}</Text>
        <Text style={styles.label}>Louder</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={-50}
        maximumValue={50}
        step={5}
        value={displayValue}
        onValueChange={handleChange}
        minimumTrackTintColor={Colors.primary}
        maximumTrackTintColor={Colors.surfaceLight}
        thumbTintColor={Colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Layout.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
```

**Note:** This uses `@react-native-community/slider`. Check if already installed; if not:
```bash
npx expo install @react-native-community/slider
```

### 8. Wire Up TrackDetailModal

Add to props:
```typescript
interface TrackDetailModalProps {
  // ... existing
  onUpdateVolume: (trackId: string, volumeAdjust: number | null) => void;
}
```

In Library screen, add handler:
```typescript
const handleUpdateVolume = useCallback(async (
  trackId: string,
  volumeAdjust: number | null
) => {
  await useTrackStore.getState().updateTrack(trackId, { volumeAdjust });
}, []);
```

---

## Testing Checklist

1. Fresh install creates tracks table with `volume_adjust` column
2. Existing database migrates correctly
3. Set volume to -50 → track plays noticeably quieter
4. Set volume to +50 → track plays noticeably louder
5. Set volume to 0 or null → plays at master volume
6. Switching tracks restores master volume before applying new track's adjustment
7. Stopping playback restores master volume
8. Slider shows "Normal" at 0, percentages otherwise
9. Slider snaps to 5% increments

---

## Gotchas / Notes

1. **Volume restoration timing** — When track ends naturally (via end time or file end), ensure master volume is restored before next track starts. The `PlaybackQueueEnded` or `PlaybackTrackChanged` events can trigger this.

2. **Slider package** — We may already have a slider from the VolumeSlider component. Check if we can reuse the same package or component.

3. **Step size** — 5% increments are easier to adjust than 1%. Users don't need fine-grained control here.

4. **Range limits** — -50 to +50 gives a 2:1 range (half to 1.5x). Going beyond could cause clipping or inaudibility.

5. **Visual feedback** — Consider showing the effective volume in the NowPlaying bar when a track with adjustment is playing.

6. **Persistence** — Volume adjustment is per-track, so it applies whether the track is played via tag button or direct button.

---

## Key Files

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `volumeAdjust` |
| `src/db/schema.ts` | Bump version, add MIGRATION_V3 |
| `src/db/init.ts` | Run migration |
| `src/db/queries/tracks.ts` | Handle new column |
| `src/services/player/index.ts` | Apply effective volume, add helper |
| `src/components/modals/TrackDetailModal.tsx` | Add VolumeAdjustSlider section |
| `src/components/modals/VolumeAdjustSlider.tsx` | New component |
| `app/(tabs)/library.tsx` | Wire `onUpdateVolume` |

---

*Handed off by Vaelthrix the Astral*
