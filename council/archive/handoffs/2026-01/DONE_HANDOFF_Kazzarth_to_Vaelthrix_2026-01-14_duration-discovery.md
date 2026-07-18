# Handoff: Duration Discovery for Cue Points

**From:** Kazzarth the Blue
**To:** Vaelthrix the Astral
**Date:** 2026-01-14
**Related Quest:** HT-032 (Cue Points feature broken)

---

## Context

The cue points feature (B9 in TEST_PLAN_1.1.0.md) is completely non-functional. Track duration is never extracted during import, so the CuePointEditor shows "Duration unknown - cue points unavailable" for all tracks.

## What Was Done

- Confirmed bug via QA testing: freshly imported tracks have `durationMs: null`
- Traced the gap: `src/services/import/metadata.ts:65` sets `durationMs: null` with comment "Set when track is loaded for playback"
- Verified no code exists to populate duration after playback
- This affects ALL tracks, not just legacy data

## What's Next

Implement duration discovery. Two possible approaches:

### Option A: Discover on first playback (minimal)
1. In `playTrack()` after `TrackPlayer.play()` succeeds, call `TrackPlayer.getProgress()`
2. If `track.durationMs` is null and progress.duration > 0, call `updateTrack()` to persist
3. Requires track to be played once before cue points work

### Option B: Discover during import (better UX)
1. Use `expo-av` Audio.Sound to load the file and get duration without playing
2. Update metadata extraction to include duration
3. Cue points work immediately after import

### Option C: Hybrid
- Attempt expo-av during import (Option B)
- Fall back to playback discovery (Option A) if expo-av fails

## Key Files

- `src/services/import/metadata.ts:50-67` — `extractMetadata()` where duration should be set
- `src/services/player/index.ts:262-327` — `playTrack()` where duration could be discovered
- `src/stores/useTrackStore.ts` — `updateTrack()` for persisting discovered duration
- `src/db/queries/tracks.ts:122` — DB update already supports durationMs

## Gotchas / Notes

- `TrackPlayer.getProgress()` returns `{ position, duration, buffered }` — duration is in seconds
- For content:// URIs, expo-av may need special handling
- The CuePointEditor component already handles null duration gracefully (shows unavailable message)
- Consider refreshing the track list after duration discovery so UI updates

---

*Handed off by Kazzarth the Blue*
