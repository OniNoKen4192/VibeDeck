# Handoff: Track Start/End Time (Cue Points)

**From:** Vaelthrix the Astral
**To:** Pyrrhaxis the Ember
**Date:** 2026-01-11
**Related Quest:** 1.1.0 Feature — Track start/end time

---

## Context

Users want to set cue points so only a portion of a track plays. For example, skip a 10-second intro or cut off after the first chorus. This is especially useful for game-day audio where you want tight, consistent timing.

## Design

### Data Model

Add two nullable fields to the Track type:

```typescript
// src/types/index.ts
export interface Track {
  // ... existing fields
  startTimeMs: number | null;  // Cue in point (null = start at 0)
  endTimeMs: number | null;    // Cue out point (null = play to end)
}
```

**Constraints:**
- `startTimeMs` must be < `endTimeMs` (if both set)
- Both must be within `0..durationMs`
- `null` means "use natural boundary"

---

## Implementation

### 1. Database Migration

**File:** `src/db/schema.ts`

Increment `SCHEMA_VERSION` to 2 and add migration:

```typescript
export const SCHEMA_VERSION = 2;

// Add to CREATE_TABLES_SQL (for fresh installs):
// In the tracks table, after duration_ms:
//   start_time_ms INTEGER,
//   end_time_ms INTEGER,

// Create a new migration file or add inline:
export const MIGRATION_V2 = `
  ALTER TABLE tracks ADD COLUMN start_time_ms INTEGER;
  ALTER TABLE tracks ADD COLUMN end_time_ms INTEGER;
`;
```

**File:** `src/db/init.ts`

Add migration logic:

```typescript
import { MIGRATION_V2 } from './schema';

// In initDatabase(), after checking currentVersion:
if (currentVersion < 2) {
  await db.execAsync(MIGRATION_V2);
}
```

### 2. Update Track Queries

**File:** `src/db/queries/tracks.ts`

Update `TrackRow` interface:
```typescript
interface TrackRow {
  // ... existing
  start_time_ms: number | null;
  end_time_ms: number | null;
}
```

Update `rowToTrack`:
```typescript
function rowToTrack(row: TrackRow): Track {
  return {
    // ... existing
    startTimeMs: row.start_time_ms,
    endTimeMs: row.end_time_ms,
  };
}
```

Update `insertTrack` to include new fields.

Update `updateTrack` to handle new fields:
```typescript
if (updates.startTimeMs !== undefined) {
  fields.push('start_time_ms = ?');
  values.push(updates.startTimeMs);
}
if (updates.endTimeMs !== undefined) {
  fields.push('end_time_ms = ?');
  values.push(updates.endTimeMs);
}
```

### 3. Update Types

**File:** `src/types/index.ts`

```typescript
export interface Track {
  // ... existing
  startTimeMs: number | null;
  endTimeMs: number | null;
}
```

### 4. Player Integration

**File:** `src/services/player/index.ts`

Modify `playTrack` to seek to start position and set up end monitoring:

```typescript
export async function playTrack(track: Track): Promise<PlaybackResult> {
  // ... existing validation and setup ...

  await TrackPlayer.add({
    // ... existing
  });

  currentTrackRef = track;

  // Seek to start time if set
  if (track.startTimeMs && track.startTimeMs > 0) {
    await TrackPlayer.seekTo(track.startTimeMs / 1000);
  }

  await TrackPlayer.play();

  return { success: true };
}
```

For end time, use the playback progress listener. In `playbackService.ts`:

```typescript
TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async (event) => {
  const track = currentTrackRef; // Need to export or access this
  if (track?.endTimeMs) {
    const currentMs = event.position * 1000;
    if (currentMs >= track.endTimeMs) {
      await TrackPlayer.stop();
    }
  }
});
```

**Alternative:** Use `TrackPlayer.updateOptions({ progressUpdateEventInterval: 1 })` and monitor in the event listener.

### 5. UI: Cue Point Editor in TrackDetailModal

**File:** `src/components/modals/TrackDetailModal.tsx`

Add a new section after Tags for cue points:

```tsx
{/* Cue Points section */}
<View style={styles.divider} />
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Cue Points</Text>
  <CuePointEditor
    durationMs={track.durationMs}
    startTimeMs={track.startTimeMs}
    endTimeMs={track.endTimeMs}
    onChange={(start, end) => onUpdateCuePoints(track.id, start, end)}
  />
</View>
```

### 6. CuePointEditor Component

Create: `src/components/modals/CuePointEditor.tsx`

```tsx
/**
 * @file components/modals/CuePointEditor.tsx
 * @description Dual-slider for setting track start/end cue points.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { formatDuration } from '../../utils/time';

interface CuePointEditorProps {
  durationMs: number | null;
  startTimeMs: number | null;
  endTimeMs: number | null;
  onChange: (startMs: number | null, endMs: number | null) => void;
}

export function CuePointEditor({
  durationMs,
  startTimeMs,
  endTimeMs,
  onChange,
}: CuePointEditorProps) {
  if (!durationMs) {
    return (
      <Text style={styles.unavailable}>
        Duration unknown — cue points unavailable
      </Text>
    );
  }

  const hasCustomCues = startTimeMs !== null || endTimeMs !== null;
  const displayStart = startTimeMs ?? 0;
  const displayEnd = endTimeMs ?? durationMs;

  const handleClear = () => {
    onChange(null, null);
  };

  // For MVP: Simple text display + clear button
  // Future: Add dual-thumb slider component

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.timeBlock}>
          <Text style={styles.label}>Start</Text>
          <Text style={styles.time}>{formatDuration(displayStart)}</Text>
        </View>
        <FontAwesome name="arrow-right" size={16} color={Colors.textMuted} />
        <View style={styles.timeBlock}>
          <Text style={styles.label}>End</Text>
          <Text style={styles.time}>{formatDuration(displayEnd)}</Text>
        </View>
      </View>

      {hasCustomCues && (
        <Pressable
          style={styles.clearButton}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear cue points"
        >
          <FontAwesome name="times" size={14} color={Colors.textSecondary} />
          <Text style={styles.clearText}>Clear Cues</Text>
        </Pressable>
      )}

      <Text style={styles.hint}>
        Tap start/end to edit (coming soon: scrubber)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Layout.spacing.md,
  },
  unavailable: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.xl,
  },
  timeBlock: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  time: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Layout.spacing.sm,
  },
  clearText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
```

### 7. Wire Up TrackDetailModal

Add to props:
```typescript
interface TrackDetailModalProps {
  // ... existing
  onUpdateCuePoints: (trackId: string, startMs: number | null, endMs: number | null) => void;
}
```

In Library screen, add handler:
```typescript
const handleUpdateCuePoints = useCallback(async (
  trackId: string,
  startMs: number | null,
  endMs: number | null
) => {
  await useTrackStore.getState().updateTrack(trackId, {
    startTimeMs: startMs,
    endTimeMs: endMs,
  });
}, []);
```

---

## Testing Checklist

1. Fresh install creates tracks table with new columns
2. Existing database migrates correctly (columns added)
3. Set start time → track plays from that point
4. Set end time → track stops at that point
5. Set both → plays the defined segment
6. Clear cues → plays full track
7. Start time >= end time → validation error or prevented
8. Cues beyond duration → clamped to valid range
9. Track with unknown duration → UI shows unavailable message

---

## Gotchas / Notes

1. **Progress monitoring performance** — The `PlaybackProgressUpdated` event fires frequently. Be efficient in the handler. Consider using a tolerance (stop within 500ms of end time).

2. **Seek latency** — There may be a brief moment of audio from 0ms before the seek completes. If noticeable, consider starting paused, seeking, then playing.

3. **UI complexity** — A proper dual-thumb slider is complex. For MVP, consider tap-to-edit with number input, or defer the visual scrubber to 1.2.

4. **Persistence** — Cue points are per-track, not per-button. A track plays with the same cues regardless of which button triggers it.

5. **Migration safety** — SQLite's ALTER TABLE ADD COLUMN is safe for nullable columns with no default. No data loss risk.

---

## Key Files

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `startTimeMs`, `endTimeMs` |
| `src/db/schema.ts` | Bump version, add migration |
| `src/db/init.ts` | Run migration |
| `src/db/queries/tracks.ts` | Handle new columns |
| `src/services/player/index.ts` | Seek to start, monitor for end |
| `src/components/modals/TrackDetailModal.tsx` | Add CuePointEditor section |
| `src/components/modals/CuePointEditor.tsx` | New component |
| `app/(tabs)/library.tsx` | Wire `onUpdateCuePoints` |

---

*Handed off by Vaelthrix the Astral*

---

## Completion Sign-Off

**Completed by:** Pyrrhaxis the Ember
**Date:** 2026-01-11
**Status:** COMPLETE

### Implementation Notes

All items from Vaelthrix's design were implemented:

1. **Data Model** — Added `startTimeMs` and `endTimeMs` to Track type
2. **Database Migration** — Schema v2 with migration for existing installs
3. **Query Updates** — Updated tracks.ts, trackTags.ts, and buttons.ts queries
4. **Player Integration** — Seek to start time before play, progress monitoring stops at end time (with 250ms tolerance)
5. **CuePointEditor** — Tap-to-edit UI with M:SS input modal, segment duration display, and "Clear Cues" button
6. **TrackDetailModal Integration** — Cue Points section added after Tags
7. **Library Screen** — Handler wired up with optimistic local state update

### Deviations from Design

- Used tap-to-edit modal instead of "coming soon" hint — full functionality delivered
- Progress update interval set to 500ms for efficiency
- Seek happens before play() to avoid brief audio blip from 0ms

### Testing

- TypeScript: No errors
- ESLint: No errors
- Build: Passes

Ready for human testing on device.

*Forged in flame by Pyrrhaxis the Ember*
