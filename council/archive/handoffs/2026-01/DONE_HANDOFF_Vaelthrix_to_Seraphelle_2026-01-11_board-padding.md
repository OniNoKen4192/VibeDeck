# Handoff: Button Board Auto-Padding

**From:** Vaelthrix the Astral
**To:** Seraphelle the Gilded
**Date:** 2026-01-11
**Related Quest:** 1.1.0 Live Fire Learning — Button board padding

---

## Context

Live fire deployment revealed that when the playback bar appears (NowPlaying slides in), the bottom row of buttons can get occluded or feel cramped. The footer height changes dynamically but the scroll content padding is static.

## Current Layout

```
container (flex: 1)
├── ScrollView (flex: 1)
│   └── grid (paddingBottom: 24px)
└── footer
    ├── PlaybackControls (~60px, always visible)
    └── NowPlaying (~56px, slides in when track loaded)
```

The footer is a sibling to ScrollView, not overlapping. When NowPlaying appears:
- Footer grows by ~56px
- ScrollView shrinks (flex behavior)
- Last row content may feel cramped at the scroll bottom

## The Problem

Current: `paddingBottom: Layout.spacing.xl` (24px) in `scrollContent` style.

This is tight. When scrolled to the bottom:
1. Last row of buttons is right at the edge
2. When NowPlaying slides in, the view feels cramped
3. Touch targets near the bottom edge compete with the footer

## The Fix

Increase the bottom padding of the scroll content to give the bottom row breathing room.

**Option A: Static padding increase**

Simple fix — just increase `paddingBottom`:

```typescript
// ButtonBoard.tsx line 148
scrollContent: {
  padding: Layout.screenPadding,
  paddingBottom: Layout.spacing.xl + Layout.nowPlayingHeight, // 24 + 48 = 72px
},
```

Or add a new constant to `layout.ts`:
```typescript
// layout.ts
boardBottomPadding: 72, // Accounts for NowPlaying slide-in
```

**Option B: Dynamic padding based on playback state**

More complex but more precise — adjust padding when track is loaded:

```typescript
// ButtonBoard.tsx - add prop
interface ButtonBoardProps {
  // ... existing
  hasActiveTrack?: boolean;
}

// In styles
const dynamicPadding = hasActiveTrack
  ? Layout.spacing.xl + Layout.nowPlayingHeight
  : Layout.spacing.xl;

<ScrollView
  contentContainerStyle={[
    styles.scrollContent,
    { paddingBottom: dynamicPadding }
  ]}
>
```

**Recommendation:** Start with Option A. The extra 48px padding when no track is playing is harmless — just a bit more scroll space. Keeps the code simple.

## What's Next

### 1. Update scrollContent padding

**File:** `src/components/ButtonBoard.tsx` (line 148)

Change from:
```typescript
scrollContent: {
  padding: Layout.screenPadding,
  paddingBottom: Layout.spacing.xl,
},
```

To:
```typescript
scrollContent: {
  padding: Layout.screenPadding,
  paddingBottom: Layout.spacing.xl + Layout.nowPlayingHeight, // 72px
},
```

### 2. (Optional) Add constant to layout.ts

If you prefer named constants:

```typescript
// layout.ts
boardBottomPadding: 72, // Space for NowPlaying + breathing room
```

Then in ButtonBoard.tsx:
```typescript
paddingBottom: Layout.boardBottomPadding,
```

### 3. Test scenarios

Verify:
- [ ] Scroll to bottom with no track → last row has breathing room
- [ ] Start playback → NowPlaying slides in, last row still fully visible
- [ ] Stop playback → NowPlaying slides out, no jarring layout shift
- [ ] Many buttons (4+ rows) → scroll works smoothly, bottom row always tappable

## Key Files

| File | Change |
|------|--------|
| `src/components/ButtonBoard.tsx` | Increase `paddingBottom` in `scrollContent` style |
| `src/constants/layout.ts` | (Optional) Add `boardBottomPadding` constant |

## Gotchas / Notes

1. **Static is fine** — The extra padding when no track is playing is invisible to the user. They just have more scroll space. No need for dynamic calculation.

2. **Don't use absolute positioning** — The current sibling layout (ScrollView + footer) is correct. Don't overlay the footer on top of the ScrollView.

3. **NowPlaying height is 48px** — Defined in `Layout.nowPlayingHeight`. Use this constant, don't hardcode.

4. **Test with full grid** — Make sure to test with enough buttons to require scrolling (7+ buttons on a 3-column layout).

---

*Handed off by Vaelthrix the Astral*
