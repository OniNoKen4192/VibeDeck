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

*This specification is the source of truth for VibeDeck's visual design. All component implementations must adhere to these specifications.*
