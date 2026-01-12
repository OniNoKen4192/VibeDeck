# Handoff: Track List Sorting

**From:** Vaelthrix the Astral
**To:** Seraphelle the Gilded
**Date:** 2026-01-11
**Related Quest:** 1.1.0 Feature — Track list sorting

---

## Context

The library screen currently shows tracks in a fixed order: newest first (`created_at DESC`). Users need the ability to sort alphabetically for easier browsing when they have many tracks.

## Current State

- Tracks loaded from SQLite ordered by `created_at DESC` (newest first)
- No sorting UI or client-side sort logic exists
- `filteredTracks` memo handles search filtering only

**Key file:** `app/(tabs)/library.tsx` lines 111-121

## Design

### Sorting Options

| Option | Sort Key | Direction |
|--------|----------|-----------|
| Most Recent | `created_at` | DESC (default) |
| A → Z | `title` (or `fileName`) | ASC |
| Z → A | `title` (or `fileName`) | DESC |

### UI Placement

Add a sort button to the **LibraryHeader** component, next to the Import button:

```
[Library]                    [Sort ▼] [+ Import]
```

Or integrate with the **SearchBar** row:

```
[🔍 Search...              ] [Sort ▼]
```

**Recommendation:** Add to LibraryHeader for visibility. The sort button should show the current sort mode (icon or text).

### Sort Button Behavior

**Option A: Cycle button** (simplest)
- Tap cycles: Recent → A-Z → Z-A → Recent
- Icon shows current mode (clock, arrow-down-a-z, arrow-up-z-a)

**Option B: Dropdown menu** (more explicit)
- Tap opens a small menu with the three options
- Current option highlighted

**Recommendation:** Option A (cycle button) for simplicity. Three states is manageable.

## What's Next

### 1. Add sort state to library.tsx

```typescript
type SortMode = 'recent' | 'az' | 'za';
const [sortMode, setSortMode] = useState<SortMode>('recent');
```

### 2. Create sorted tracks memo

After `filteredTracks`, add sorting:

```typescript
const sortedTracks = useMemo(() => {
  const sorted = [...filteredTracks];

  switch (sortMode) {
    case 'az':
      return sorted.sort((a, b) => {
        const titleA = (a.title || a.fileName).toLowerCase();
        const titleB = (b.title || b.fileName).toLowerCase();
        return titleA.localeCompare(titleB);
      });
    case 'za':
      return sorted.sort((a, b) => {
        const titleA = (a.title || a.fileName).toLowerCase();
        const titleB = (b.title || b.fileName).toLowerCase();
        return titleB.localeCompare(titleA);
      });
    case 'recent':
    default:
      // Already sorted by created_at DESC from database
      return sorted;
  }
}, [filteredTracks, sortMode]);
```

Use `sortedTracks` instead of `filteredTracks` in the FlatList.

### 3. Update LibraryHeader

**File:** `src/components/library/LibraryHeader.tsx`

Add new props:
```typescript
interface LibraryHeaderProps {
  onImport: () => void;
  isImporting?: boolean;
  sortMode: SortMode;
  onSortChange: () => void;  // Cycles to next mode
  testID?: string;
}
```

Add sort button before import button:
```tsx
<Pressable onPress={onSortChange} style={styles.sortButton}>
  <Ionicons name={getSortIcon(sortMode)} size={18} color={Colors.text} />
</Pressable>
```

Icon helper:
```typescript
function getSortIcon(mode: SortMode): string {
  switch (mode) {
    case 'az': return 'arrow-down';  // or use text "A↓Z"
    case 'za': return 'arrow-up';    // or use text "Z↓A"
    case 'recent':
    default: return 'time-outline';
  }
}
```

### 4. Wire up in library.tsx

```typescript
const handleSortChange = useCallback(() => {
  setSortMode((prev) => {
    switch (prev) {
      case 'recent': return 'az';
      case 'az': return 'za';
      case 'za': return 'recent';
    }
  });
}, []);
```

Pass to LibraryHeader:
```tsx
<LibraryHeader
  onImport={handleImport}
  isImporting={isImporting}
  sortMode={sortMode}
  onSortChange={handleSortChange}
/>
```

### 5. (Optional) Persist sort preference

If users expect sort preference to persist across sessions, save to settings:

```typescript
// On mount
useEffect(() => {
  getSetting('librarySortMode').then((mode) => {
    if (mode) setSortMode(mode as SortMode);
  });
}, []);

// On change
const handleSortChange = useCallback(() => {
  setSortMode((prev) => {
    const next = /* cycle logic */;
    setSetting('librarySortMode', next);
    return next;
  });
}, []);
```

This is optional — defaulting to "recent" on each session is also reasonable.

## Key Files

| File | Change |
|------|--------|
| `app/(tabs)/library.tsx` | Add sortMode state, sortedTracks memo, handler |
| `src/components/library/LibraryHeader.tsx` | Add sort button, new props |
| `src/types/index.ts` | (Optional) Export SortMode type |

## Gotchas / Notes

1. **localeCompare for sorting** — Use `localeCompare()` for proper alphabetical sorting across languages.

2. **Sort after filter** — Apply sort to `filteredTracks`, not raw `tracks`. Order: filter → sort → render.

3. **Spread before sort** — Always `[...array].sort()` since `.sort()` mutates. Never sort the original tracks array.

4. **Icon choice** — Ionicons has `time-outline` for recent, `arrow-down` / `arrow-up` for alphabetical. Or use `text-outline` with A-Z label.

5. **Accessibility** — Set `accessibilityLabel` on sort button: "Sort by most recent", "Sort A to Z", "Sort Z to A".

6. **FlatList key** — If you're using `keyExtractor={(item) => item.id}`, sorting won't cause key issues. FlatList will re-order correctly.

---

*Handed off by Vaelthrix the Astral*
