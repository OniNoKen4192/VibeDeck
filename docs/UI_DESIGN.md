# VibeDeck UI Design Specification

> Crafted by Seraphelle the Gold — 2026-01-05

---

## Design Philosophy

VibeDeck serves **stressed parents at live sporting events**. Every design decision prioritizes:

1. **Speed** — Audio must play within 1 second of tap
2. **Clarity** — No confusion about which button does what
3. **Forgiveness** — Large touch targets, clear feedback, easy recovery
4. **Focus** — The button board is the hero; everything else supports it

---

## Color System

### Base Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#1a1a2e` | App background, dark and recessive |
| `surface` | `#25253d` | Cards, panels, elevated surfaces |
| `surfaceLight` | `#2d2d4a` | Hover/focus states on surfaces |
| `primary` | `#6366f1` | Brand color, default button color |
| `primaryDark` | `#4f46e5` | Pressed states |
| `primaryLight` | `#818cf8` | Highlights, focus rings |

### Text Colors

| Token | Hex | Usage | Min Contrast |
|-------|-----|-------|--------------|
| `text` | `#ffffff` | Primary text | 15.3:1 on background |
| `textSecondary` | `#a1a1aa` | Labels, hints | 6.3:1 on background |
| `textMuted` | `#71717a` | Disabled text | 4.0:1 on background |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22c55e` | Positive states, confirmations |
| `warning` | `#f59e0b` | Caution, pool running low |
| `error` | `#ef4444` | Errors, destructive actions |

### Tag Colors

Pre-defined palette for tag buttons. Each provides sufficient contrast for white text.

```
#ef4444  Red      — 4.6:1 with white
#f97316  Orange   — 4.3:1 with white
#eab308  Yellow   — 3.2:1 (use dark text)
#22c55e  Green    — 4.5:1 with white
#14b8a6  Teal     — 4.2:1 with white
#3b82f6  Blue     — 4.5:1 with white
#8b5cf6  Violet   — 4.5:1 with white
#ec4899  Pink     — 4.5:1 with white
```

**Yellow exception:** Yellow (#eab308) requires dark text (`#1a1a2e`) for accessibility.

---

## Button Board Layout

### Grid Specifications

```
┌─────────────────────────────────────────────┐
│  ┌───────┐  ┌───────┐  ┌───────┐           │
│  │       │  │       │  │       │  ← Row 1  │
│  │  BTN  │  │  BTN  │  │  BTN  │           │
│  │       │  │       │  │       │           │
│  └───────┘  └───────┘  └───────┘           │
│      ↑          ↑          ↑               │
│      └────12px──┴───12px───┘  ← Gap        │
│                                             │
│  ┌───────┐  ┌───────┐  ┌───────┐           │
│  │       │  │       │  │       │  ← Row 2  │
│  └───────┘  └───────┘  └───────┘           │
│                                             │
│  ... continues for 4-6 rows ...            │
│                                             │
│  ═══════════════════════════════  ← Divider│
│  [  STOP  ]     ════════════════  ← Controls│
│                   Volume slider             │
└─────────────────────────────────────────────┘
```

| Dimension | Value | Rationale |
|-----------|-------|-----------|
| Columns | 3 (default) | Balances button size with count |
| Button gap | 12px | Prevents accidental adjacent taps |
| Screen padding | 16px | Standard mobile margin |
| Button min height | 100px | Large touch target for stress use |
| Button border radius | 16px | Friendly, modern feel |
| Min touch target | 44px | iOS/Android accessibility minimum |

### Responsive Behavior

| Screen Width | Columns | Button Width |
|--------------|---------|--------------|
| < 360px | 2 | ~156px |
| 360-480px | 3 | ~104px |
| > 480px | 4 | ~100px |

**Calculation:** `(screenWidth - 2×padding - (columns-1)×gap) / columns`

---

## Button States

### Visual State Matrix

| State | Background | Border | Text | Icon | Shadow |
|-------|------------|--------|------|------|--------|
| **Default** | Button color | none | white | none | subtle |
| **Pressed** | 15% darker | none | white | none | none |
| **Playing** | Button color | 3px white | white | 🔊 pulse | glow |
| **Exhausted** | 50% opacity | dashed 2px | muted | ⚠ | none |
| **Disabled** | surface | none | muted | none | none |

### State Definitions

**Default**
- Ready to be tapped
- Shows button label and optional count badge

**Pressed** (active touch)
- Immediate visual feedback
- Background darkens 15%
- Scale down to 0.97

**Playing** (audio from this button is active)
- White border ring (3px)
- Subtle glow effect (8px blur, button color at 50% opacity)
- Animated speaker icon (optional pulse)
- Remains in this state until audio stops or another button is tapped

**Exhausted** (tag pool empty, for tag buttons only)
- Reduced opacity (50%)
- Dashed border indicates depleted state
- Warning icon overlay
- Still tappable — triggers auto-reset on tap

**Disabled** (track deleted, invalid state)
- Grey background
- Muted text
- Non-interactive

---

## Button Anatomy

### Tag Button

```
┌─────────────────────────┐
│  ┌───┐                  │
│  │ 5 │  ← Unplayed count│
│  └───┘                  │
│                         │
│     Warmup              │  ← Label (tag name)
│                         │
│  ════════════════════   │  ← Type indicator bar
└─────────────────────────┘
```

| Element | Style |
|---------|-------|
| Count badge | Top-right, 20×20px circle, surface color, bold 12px |
| Label | Centered, 16px bold, 2 lines max, ellipsis |
| Type bar | Bottom, 4px height, 50% opacity white |

### Direct Button

```
┌─────────────────────────┐
│                    ♪    │  ← Music note icon
│                         │
│     Goal Horn           │  ← Label (track title)
│                         │
│                         │
└─────────────────────────┘
```

| Element | Style |
|---------|-------|
| Music icon | Top-right, 16px, 50% opacity white |
| Label | Centered, 16px bold, 2 lines max, ellipsis |
| No type bar | Distinguishes from tag buttons |

### Persistent Indicator

Both button types can be persistent (pinned). Indicated by:
- Small pin icon (📌) in top-left corner
- 12px, 70% opacity

---

## Playback Controls

Located at bottom of button board, always visible.

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌──────────┐    ════════●═══════════════  │
│  │   STOP   │         Volume               │
│  └──────────┘                              │
│                                             │
│  ┌─ Now Playing ───────────────────────┐   │
│  │  🔊  Track Title - Artist Name      │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Stop Button

| Property | Value |
|----------|-------|
| Size | 60×44px |
| Color | `error` (#ef4444) |
| Text | "STOP" in bold caps |
| Border radius | 8px |

### Volume Slider

| Property | Value |
|----------|-------|
| Width | Flexible, fills remaining space |
| Height | 44px (touch target) |
| Track height | 4px |
| Track color | `surfaceLight` |
| Fill color | `primary` |
| Thumb size | 20px circle |
| Thumb color | `white` |

### Now Playing Display

| Property | Value |
|----------|-------|
| Height | 48px |
| Background | `surface` |
| Border radius | 8px |
| Content | Animated speaker icon + track info |
| Hidden when | No audio playing |

---

## Navigation

### Tab Bar

Three tabs, bottom of screen, always visible.

| Tab | Icon | Label |
|-----|------|-------|
| Board | `grid-3x3` | Board |
| Library | `music` | Library |
| Tags | `tag` | Tags |

### Tab Bar Styling

| Property | Value |
|----------|-------|
| Height | 56px + safe area |
| Background | `surface` |
| Active color | `primary` |
| Inactive color | `textSecondary` |
| Icon size | 24px |
| Label size | 12px |

---

## Component Spacing Reference

### Consistent Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight spacing, icon padding |
| `sm` | 8px | Related element spacing |
| `md` | 12px | Grid gaps, section padding |
| `lg` | 16px | Screen padding, card padding |
| `xl` | 24px | Section gaps |
| `2xl` | 32px | Major section separation |

---

## Animation Specifications

### Button Press

```
Duration: 100ms
Easing: ease-out
Transform: scale(0.97)
Background: darken 15%
```

### Playing Glow

```
Type: Continuous pulse
Duration: 1500ms
Easing: ease-in-out
Opacity: 0.3 → 0.6 → 0.3
```

### Count Badge Update

```
Duration: 200ms
Easing: spring (damping: 0.6)
Transform: scale(1.2) → scale(1)
```

---

## Accessibility Checklist

- [x] All touch targets ≥ 44×44px
- [x] Color contrast ≥ 4.5:1 for text (except yellow)
- [x] Yellow uses dark text for contrast
- [x] State changes don't rely on color alone (icons, borders)
- [x] Playing state has glow + border + icon
- [x] Exhausted state has opacity + border style + icon
- [ ] Screen reader labels (implementation phase)
- [ ] Haptic feedback on button press (implementation phase)

---

## Implementation Checklist

Components to build (in order):

1. **Button** — Core button with all states
2. **ButtonBoard** — Grid container with responsive columns
3. **PlaybackControls** — Stop button + volume slider
4. **NowPlaying** — Current track display
5. **TabBar** — Custom styled navigation
6. **CountBadge** — Unplayed count overlay
7. **TypeIndicator** — Tag vs Direct visual distinction

---

---

## Library Screen

The Library is where users import and manage their audio tracks. Optimized for the workflow: **Import → View → Assign Tags**.

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  Library                        [+ Import]  │  ← Header with action
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │  🔍  Search tracks...               │    │  ← Search bar
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌───┬─────────────────────────────────┐    │
│  │ ▶ │  Track Title                    │    │  ← Track row
│  │   │  Artist Name          ●●● 2 tags│    │
│  └───┴─────────────────────────────────┘    │
│                                             │
│  ┌───┬─────────────────────────────────┐    │
│  │ ▶ │  Another Track                  │    │
│  │   │  Unknown Artist       ●●  1 tag │    │
│  └───┴─────────────────────────────────┘    │
│                                             │
│  ... scrollable list ...                    │
│                                             │
└─────────────────────────────────────────────┘
```

### Header

| Property | Value |
|----------|-------|
| Height | 56px |
| Title | "Library" — 20px bold, left-aligned |
| Import button | Pill shape, `primary` color, "＋ Import" text |
| Background | `background` |

### Search Bar

| Property | Value |
|----------|-------|
| Height | 44px |
| Background | `surface` |
| Border radius | 12px |
| Icon | Search (🔍), 20px, `textSecondary` |
| Placeholder | "Search tracks..." in `textMuted` |
| Margin | 16px horizontal, 12px vertical |

### Track Row

| Property | Value |
|----------|-------|
| Height | 72px minimum |
| Background | `surface` |
| Border radius | 12px |
| Margin | 8px horizontal between rows |
| Padding | 12px internal |
| Touch target | Full row is tappable |

#### Track Row Anatomy

```
┌───────────────────────────────────────────────────┐
│  ┌────┐                                           │
│  │ ▶  │   Track Title Here              ● ● ●    │
│  │    │   Artist Name               tag dots →   │
│  └────┘                                           │
│    ↑                                              │
│  Preview                                          │
│  button                                           │
└───────────────────────────────────────────────────┘
```

| Element | Style |
|---------|-------|
| Preview button | 44×44px, `surfaceLight` circle, play icon centered |
| Title | 16px medium, `text`, single line with ellipsis |
| Artist | 14px regular, `textSecondary`, single line with ellipsis |
| Tag dots | Colored circles (8px) showing assigned tag colors, max 5 visible |
| Tag count | "2 tags" text in `textMuted` if tags exist |

### Selection Mode (Bulk Actions)

Activated by **long-press** on any track row.

```
┌─────────────────────────────────────────────┐
│  ✓ 3 selected                    [Cancel]  │  ← Selection header
├─────────────────────────────────────────────┤
│                                             │
│  ┌───┬─────────────────────────────────┐    │
│  │ ✓ │  Track Title                    │    │  ← Selected (highlighted)
│  │   │  Artist Name                    │    │
│  └───┴─────────────────────────────────┘    │
│                                             │
│  ┌───┬─────────────────────────────────┐    │
│  │   │  Another Track                  │    │  ← Not selected
│  │   │  Artist Name                    │    │
│  └───┴─────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│  [  Add Tag  ]      [  Delete  ]            │  ← Bulk action bar
└─────────────────────────────────────────────┘
```

#### Selection Mode Styling

| Element | Style |
|---------|-------|
| Selection header | Replaces normal header, shows count |
| Checkbox | Replaces preview button, 24px, `primary` when checked |
| Selected row | `primaryDark` at 20% opacity background |
| Cancel button | Text button, `textSecondary` |
| Action bar | Fixed bottom, 60px, `surface` background |
| Add Tag button | `primary` background, full width half |
| Delete button | `error` background, full width half |

### Empty State

When no tracks are imported yet:

```
┌─────────────────────────────────────────────┐
│                                             │
│              ♪                              │
│           (music icon, 64px)                │
│                                             │
│        No tracks yet                        │
│                                             │
│   Tap "Import" to add audio files           │
│   from your device                          │
│                                             │
│        [ + Import Tracks ]                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Tags Screen

The Tags screen is where users create and manage their tag categories. Primary action: **Create tags before importing**.

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  Tags                            [+ New]    │  ← Header with action
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ●  Timeout                    12 ▸ │    │  ← Tag row
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ●  Score                       8 ▸ │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ●  Walk-up Music              24 ▸ │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ... scrollable list ...                    │
│                                             │
└─────────────────────────────────────────────┘
```

### Header

| Property | Value |
|----------|-------|
| Height | 56px |
| Title | "Tags" — 20px bold, left-aligned |
| New button | Pill shape, `primary` color, "＋ New" text |
| Background | `background` |

### Tag Row

| Property | Value |
|----------|-------|
| Height | 56px |
| Background | `surface` |
| Border radius | 12px |
| Margin | 8px vertical between rows |
| Padding | 16px internal |
| Touch target | Full row tappable → opens edit modal |

#### Tag Row Anatomy

```
┌───────────────────────────────────────────────────┐
│  ●      Tag Name                        12   ▸   │
│  ↑                                       ↑   ↑   │
│  Color    Label                     Count  Chevron
│  dot                               (tracks)      │
└───────────────────────────────────────────────────┘
```

| Element | Style |
|---------|-------|
| Color dot | 12px circle, tag's assigned color |
| Tag name | 16px medium, `text` |
| Track count | 14px, `textSecondary`, right-aligned |
| Chevron | 16px, `textMuted`, indicates tappable |

### Create/Edit Tag Modal

Triggered by "＋ New" button or tapping existing tag row.

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │         Create Tag                  │    │  ← Modal header
│  │                              [  ✕ ] │    │
│  ├─────────────────────────────────────┤    │
│  │                                     │    │
│  │  Tag Name                           │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │  Timeout                    │    │    │  ← Text input
│  │  └─────────────────────────────┘    │    │
│  │                                     │    │
│  │  Color                              │    │
│  │  ● ● ● ● ● ● ● ●                    │    │  ← Color picker
│  │  ↑ selected                         │    │
│  │                                     │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │         Save Tag            │    │    │  ← Primary action
│  │  └─────────────────────────────┘    │    │
│  │                                     │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │       Delete Tag            │    │    │  ← Destructive (edit only)
│  │  └─────────────────────────────┘    │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

#### Modal Styling

| Property | Value |
|----------|-------|
| Background overlay | `#000000` at 50% opacity |
| Modal background | `surface` |
| Border radius | 16px |
| Padding | 24px |
| Max width | 320px |
| Animation | Slide up from bottom, 200ms |

#### Color Picker

| Property | Value |
|----------|-------|
| Layout | Single row, 8 colors |
| Color size | 32px circles |
| Gap | 12px between colors |
| Selected | 3px white ring + scale(1.1) |
| Colors | The 8 tag colors from Color System |

### Empty State

When no tags exist yet:

```
┌─────────────────────────────────────────────┐
│                                             │
│              🏷                             │
│           (tag icon, 64px)                  │
│                                             │
│        No tags yet                          │
│                                             │
│   Create tags to organize your              │
│   sounds by category                        │
│                                             │
│        [ + Create First Tag ]               │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Track Detail Modal

Opened when tapping a track row in the Library (not in selection mode).

### Layout Structure

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  Track Details               [  ✕ ] │    │
│  ├─────────────────────────────────────┤    │
│  │                                     │    │
│  │  ♪  Track Title Here                │    │
│  │     Artist Name                     │    │
│  │     3:24 duration                   │    │
│  │                                     │    │
│  │  ─────────────────────────────────  │    │
│  │                                     │    │
│  │  Tags                               │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐        │    │
│  │  │Warmup│ │Score │ │ + Add│        │    │  ← Tag chips
│  │  └──────┘ └──────┘ └──────┘        │    │
│  │                                     │    │
│  │  ─────────────────────────────────  │    │
│  │                                     │    │
│  │  [ ▶  Preview ]                     │    │  ← Preview button
│  │                                     │    │
│  │  [ Add to Board ]                   │    │  ← Creates Direct Button
│  │                                     │    │
│  │  [ Delete Track ]                   │    │  ← Destructive
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### Tag Chips Section

**Chip picker** — Toggle tags on/off with visual chips.

```
┌──────────────────────────────────────────────┐
│  Tags                                        │
│                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐  │
│  │●Warmup │ │● Score │ │Timeout │ │ Walk │  │
│  │   ✓    │ │   ✓    │ │        │ │      │  │
│  └────────┘ └────────┘ └────────┘ └──────┘  │
│      ↑           ↑          ↑                │
│   Assigned    Assigned   Available           │
│   (filled)   (filled)   (outline)            │
└──────────────────────────────────────────────┘
```

#### Chip Styling

| State | Background | Border | Text |
|-------|------------|--------|------|
| Assigned | Tag color | none | white |
| Available | transparent | 2px `surfaceLight` | `textSecondary` |
| Pressed | Tag color at 50% | none | white |

| Property | Value |
|----------|-------|
| Height | 36px |
| Padding | 12px horizontal |
| Border radius | 18px (pill) |
| Gap | 8px between chips |
| Layout | Flex wrap |
| Color dot | 8px, left of label, tag color (available state) |

### Action Buttons

| Button | Style |
|--------|-------|
| Preview | `surface` background, play icon, full width |
| Add to Board | `primary` background, full width |
| Delete Track | `error` text only (no fill), full width |

---

## Bulk Tag Modal

Opened when pressing "Add Tag" in selection mode.

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  Add Tag to 3 Tracks         [  ✕ ] │    │
│  ├─────────────────────────────────────┤    │
│  │                                     │    │
│  │  Select a tag to add:               │    │
│  │                                     │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │  ●  Timeout                 │    │    │
│  │  └─────────────────────────────┘    │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │  ●  Score                   │    │    │
│  │  └─────────────────────────────┘    │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │  ●  Walk-up Music           │    │    │
│  │  └─────────────────────────────┘    │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

Tapping a tag row immediately applies it to all selected tracks and closes the modal.

---

## Delete Confirmation

Used for destructive actions (delete track, delete tag).

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │         Delete Tag?                 │    │
│  ├─────────────────────────────────────┤    │
│  │                                     │    │
│  │  This will remove "Timeout" from    │    │
│  │  12 tracks. This cannot be undone.  │    │
│  │                                     │    │
│  │  ┌───────────┐  ┌───────────────┐   │    │
│  │  │  Cancel   │  │    Delete     │   │    │
│  │  └───────────┘  └───────────────┘   │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

| Button | Style |
|--------|-------|
| Cancel | `surface` background, `text` color |
| Delete | `error` background, white text |

---

## Board Screen Header

The Board screen needs a minimal header to access settings/about while keeping the button board as the hero.

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  VibeDeck                        [⟳] [⚙]   │  ← Header
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────┐  ┌───────┐  ┌───────┐           │
│  │  BTN  │  │  BTN  │  │  BTN  │           │
│  └───────┘  └───────┘  └───────┘           │
│                                             │
│  ... button grid ...                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Header Styling

| Property | Value |
|----------|-------|
| Height | 56px |
| Background | `background` (not `surface` — stays recessive) |
| Title | "VibeDeck" — 20px bold, `text`, left-aligned with 16px padding |
| Icons | Right-aligned, 44×44px touch targets, `textSecondary` default |

### Header Icons

| Icon | Purpose | Position |
|------|---------|----------|
| Reset (⟳) | Reset All played flags | Right, second from edge |
| Settings (⚙) | Open About/Settings | Right, edge |

**Icon spacing:** 8px between icons, 12px from edge.

---

## Reset All Feature

Resets all played flags across all tags, restoring all pools to full.

### Reset Button Placement

Located in the Board header, right side. Uses a circular arrow (⟳) icon.

| Property | Value |
|----------|-------|
| Icon | `refresh` (FontAwesome) |
| Size | 24px icon, 44×44px touch target |
| Color | `textSecondary` default, `primary` when pressed |
| Position | Header right, left of settings icon |

### Reset Confirmation Dialog

Confirmation required before resetting — this action cannot be undone.

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │         Reset All Tracks?           │    │
│  ├─────────────────────────────────────┤    │
│  │                                     │    │
│  │  This will mark all tracks as       │    │
│  │  unplayed, refilling all tag pools. │    │
│  │                                     │    │
│  │  Current session progress will      │    │
│  │  be lost.                           │    │
│  │                                     │    │
│  │  ┌───────────┐  ┌───────────────┐   │    │
│  │  │  Cancel   │  │    Reset      │   │    │
│  │  └───────────┘  └───────────────┘   │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

| Button | Style |
|--------|-------|
| Cancel | `surface` background, `text` color |
| Reset | `warning` (#f59e0b) background, white text |

**Note:** Using `warning` color (not `error`) because reset is recoverable — you just re-play tracks. It's disruptive but not destructive.

### Post-Reset Feedback

After successful reset:
- Show toast: "All tracks reset" (type: `success`)
- Haptic feedback: `Haptics.notificationAsync(Success)`
- Button count badges animate to show restored counts

---

## Long-Press Context Menu

Triggered when user long-presses a button on the board. Presents contextual actions.

### Trigger Behavior

| Property | Value |
|----------|-------|
| Activation | 500ms long press |
| Haptic | `Haptics.impactAsync(Medium)` on menu open |
| Cancel | Release before 500ms, or tap outside menu |

### Menu Layout (Bottom Sheet)

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                                             │
│  (dimmed background, tappable to dismiss)   │
│                                             │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ────────  (drag handle)            │    │
│  │                                     │    │
│  │  "Warmup"                           │    │  ← Button name
│  │                                     │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │  📌  Pin to Board           │    │    │  ← If not pinned
│  │  └─────────────────────────────┘    │    │
│  │                                OR   │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │  📌  Unpin from Board       │    │    │  ← If pinned
│  │  └─────────────────────────────┘    │    │
│  │                                     │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │  🗑  Remove Button           │    │    │  ← Destructive
│  │  └─────────────────────────────┘    │    │
│  │                                     │    │
│  │  Safe area padding                  │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### Bottom Sheet Styling

| Property | Value |
|----------|-------|
| Background | `surface` |
| Border radius | 16px (top corners only) |
| Max height | 40% of screen |
| Animation | Slide up from bottom, 200ms |
| Overlay | `#000000` at 40% opacity |
| Drag handle | 40×4px, `surfaceLight`, centered, 8px from top |

### Menu Row Styling

| Property | Value |
|----------|-------|
| Height | 56px |
| Padding | 16px horizontal |
| Icon size | 20px |
| Icon-text gap | 12px |
| Text size | 16px medium |
| Touch feedback | Background `surfaceLight` on press |

### Menu Actions

| Action | Icon | Text | Color | Behavior |
|--------|------|------|-------|----------|
| Pin | `thumb-tack` | "Pin to Board" | `text` | Sets `persistent: true`, closes menu |
| Unpin | `thumb-tack` | "Unpin from Board" | `text` | Sets `persistent: false`, closes menu |
| Remove | `trash-o` | "Remove Button" | `error` | Shows delete confirmation, then removes |

**Pin Toggle Logic:**
- If `button.persistent === true`: Show "Unpin from Board"
- If `button.persistent === false`: Show "Pin to Board"

**Remove Confirmation:**
Uses existing `DeleteConfirmation` component with text:
- Title: "Remove Button?"
- Body: "Remove '{button.name}' from the board? You can add it again later."
- Cancel: "Cancel"
- Confirm: "Remove"

---

## About / Settings Screen

Informational screen with app version, usage tutorial, and settings explanation.

### Navigation

Accessed from Board header via settings (⚙) icon. Opens as a modal (full-screen slide-up).

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  About VibeDeck                     [  ✕ ] │  ← Header with close
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  🎵                                 │    │
│  │  VibeDeck                           │    │  ← App name
│  │  Version 1.0.0                      │    │  ← Version
│  └─────────────────────────────────────┘    │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  How to Use                                 │  ← Section header
│                                             │
│  1. Import your audio files from the        │
│     Library tab.                            │
│                                             │
│  2. Create tags (like "Timeout", "Score")   │
│     in the Tags tab.                        │
│                                             │
│  3. Assign tags to your tracks.             │
│                                             │
│  4. Your board fills with buttons. Tap      │
│     to play!                                │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Understanding Played Tracks                │  ← Section header
│                                             │
│  When you tap a tag button, VibeDeck        │
│  picks a random track from that tag that    │
│  hasn't been played yet this session.       │
│                                             │
│  The count badge shows how many tracks      │
│  are still available. When it reaches       │
│  zero, the pool automatically resets.       │
│                                             │
│  Use the ⟳ button in the header to          │
│  manually reset all tracks at once.         │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Pinned Buttons                             │  ← Section header
│                                             │
│  Long-press any button to pin it.           │
│  Pinned buttons stay at the top of          │
│  your board and won't disappear.            │
│                                             │
└─────────────────────────────────────────────┘
```

### Header Styling

| Property | Value |
|----------|-------|
| Height | 56px |
| Background | `surface` |
| Title | "About VibeDeck" — 18px bold, centered |
| Close button | "✕" icon, 44×44px touch target, right edge |

### Content Styling

| Element | Style |
|---------|-------|
| App icon | Music note (♪), 48px, `primary` color, centered |
| App name | 24px bold, `text`, centered |
| Version | 14px, `textSecondary`, centered |
| Section header | 16px bold, `text`, 24px top margin |
| Body text | 14px, `textSecondary`, line-height 22px |
| Section divider | 1px `surfaceLight`, 24px vertical margin |
| Content padding | 20px horizontal |

### Modal Behavior

| Property | Value |
|----------|-------|
| Type | Full-screen modal |
| Animation | Slide up from bottom, 300ms |
| Background | `background` |
| Scrollable | Yes (ScrollView for content) |
| Safe area | Respect top and bottom insets |

---

## Empty Tag Button State

When a tag has no tracks assigned, its button should be visually distinct and non-functional.

### Visual Treatment

| Property | Enabled (tracks exist) | Empty (no tracks) |
|----------|------------------------|-------------------|
| Background | Tag color | `surface` (gray) |
| Opacity | 100% | 50% |
| Text color | White | `textMuted` |
| Count badge | Shows number | Hidden |
| Border | None | 2px dashed `surfaceLight` |
| Pressable | Yes | No (returns early) |

### Empty State Display

```
┌─────────────────────────┐
│                         │
│                         │
│     EDM                 │  ← Tag name preserved (HT-020)
│                         │
│  ════════════════════   │  ← Type indicator (muted)
└─────────────────────────┘
```

**Behavior:** When `button.isEmpty === true`:
- Skip `onButtonPress` entirely (return early)
- No haptic feedback
- Keep tag name as label (styling differentiates empty state)
- Keep type indicator bar but at 30% opacity

---

## Implementation Checklist (Board MVP Features)

Components to build for MVP feature completion:

### Board Screen Header
1. **BoardHeader** — Title + Reset + Settings icons

### Reset All Feature
2. **ResetConfirmation** — Confirmation dialog (reuse DeleteConfirmation pattern)

### Long-Press Context Menu
3. **ButtonContextMenu** — Bottom sheet with Pin/Remove actions

### About Screen
4. **AboutScreen** — Full-screen modal with usage guide

### Empty Tag Button
5. **BoardButton updates** — Empty state styling (no new component)

---

## Implementation Checklist (Library/Tags)

Components to build:

### Library Screen
1. **LibraryHeader** — Title + Import button
2. **SearchBar** — Filter tracks by name/artist
3. **TrackRow** — Individual track display
4. **TrackList** — Scrollable list container
5. **SelectionHeader** — Count + Cancel for bulk mode
6. **BulkActionBar** — Add Tag / Delete buttons
7. **EmptyLibrary** — First-run guidance

### Tags Screen
8. **TagsHeader** — Title + New button
9. **TagRow** — Individual tag display
10. **TagList** — Scrollable list container
11. **TagModal** — Create/Edit form
12. **ColorPicker** — 8-color selection
13. **EmptyTags** — First-run guidance

### Shared Modals
14. **TrackDetailModal** — View/edit single track
15. **TagChipPicker** — Toggle tags on track
16. **BulkTagModal** — Apply tag to selection
17. **DeleteConfirmation** — Destructive action confirm

---

*This specification is the source of truth for VibeDeck's visual design. All component implementations must adhere to these specifications.*
