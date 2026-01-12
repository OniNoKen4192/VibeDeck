# Handoff: Rename Track

**From:** Vaelthrix the Astral
**To:** Seraphelle the Gilded
**Date:** 2026-01-11
**Related Quest:** 1.1.0 Feature — Rename Track

---

## Context

Users need to rename tracks after import. Currently the TrackDetailModal shows metadata as read-only. The database and store already support updates — we just need edit UI.

## Current State

**File:** `src/components/modals/TrackDetailModal.tsx`
- Lines 101-102: Display title and artist as read-only text
- Lines 141-144: Renders title/artist in `<Text>` components

**Already exists:**
- `useTrackStore.updateTrack(id, updates)` — lines 77-85
- `trackQueries.updateTrack(id, updates)` — lines 84-130 in `src/db/queries/tracks.ts`

## Design

### Option A: Inline Edit (Tap to Edit)

Tap the title or artist text to switch it to a `TextInput`. Simple, minimal UI change.

```
[Music Icon]  Track Title ✏️     <- Tap to edit
              Artist Name ✏️     <- Tap to edit
              3:45
```

### Option B: Edit Button + Modal

Add an "Edit" button that opens a separate edit modal with text inputs.

**Recommendation:** Option A (inline edit) is simpler and more intuitive. Users tap what they want to change.

## What's Next

### 1. Add edit state to TrackDetailModal

```typescript
const [isEditingTitle, setIsEditingTitle] = useState(false);
const [isEditingArtist, setIsEditingArtist] = useState(false);
const [editTitle, setEditTitle] = useState('');
const [editArtist, setEditArtist] = useState('');
```

Initialize edit values when track changes:
```typescript
useEffect(() => {
  if (track) {
    setEditTitle(track.title || track.fileName);
    setEditArtist(track.artist || '');
    setIsEditingTitle(false);
    setIsEditingArtist(false);
  }
}, [track]);
```

### 2. Add onRename prop

```typescript
interface TrackDetailModalProps {
  // ... existing props ...
  onRename: (trackId: string, updates: { title?: string; artist?: string }) => void;
}
```

### 3. Create inline edit component

Make title tappable to switch to TextInput:

```tsx
{isEditingTitle ? (
  <TextInput
    style={styles.titleInput}
    value={editTitle}
    onChangeText={setEditTitle}
    onBlur={() => handleSaveTitle()}
    onSubmitEditing={() => handleSaveTitle()}
    autoFocus
    selectTextOnFocus
  />
) : (
  <Pressable onPress={() => setIsEditingTitle(true)}>
    <Text style={styles.title} numberOfLines={2}>
      {displayTitle}
      <FontAwesome name="pencil" size={14} color={Colors.textMuted} />
    </Text>
  </Pressable>
)}
```

Same pattern for artist.

### 4. Handle save

```typescript
const handleSaveTitle = useCallback(() => {
  setIsEditingTitle(false);
  const newTitle = editTitle.trim();
  if (newTitle && newTitle !== track?.title) {
    onRename(track!.id, { title: newTitle });
  }
}, [editTitle, track, onRename]);

const handleSaveArtist = useCallback(() => {
  setIsEditingArtist(false);
  const newArtist = editArtist.trim();
  if (newArtist !== (track?.artist || '')) {
    onRename(track!.id, { artist: newArtist || null });
  }
}, [editArtist, track, onRename]);
```

### 5. Wire up in library.tsx

Add handler:
```typescript
const handleRenameTrack = useCallback(async (
  trackId: string,
  updates: { title?: string; artist?: string }
) => {
  await useTrackStore.getState().updateTrack(trackId, updates);
  showToast('Track updated', 'success');
}, [showToast]);
```

Pass to modal:
```tsx
<TrackDetailModal
  // ... existing props ...
  onRename={handleRenameTrack}
/>
```

### 6. Add styles for input

```typescript
titleInput: {
  fontSize: 18,
  fontWeight: '600',
  color: Colors.text,
  backgroundColor: Colors.surface,
  borderRadius: 4,
  paddingHorizontal: 8,
  paddingVertical: 4,
  marginBottom: 4,
},
artistInput: {
  fontSize: 14,
  color: Colors.textSecondary,
  backgroundColor: Colors.surface,
  borderRadius: 4,
  paddingHorizontal: 8,
  paddingVertical: 4,
},
```

## Key Files

| File | Change |
|------|--------|
| `src/components/modals/TrackDetailModal.tsx` | Add edit state, inline TextInputs, save handlers |
| `app/(tabs)/library.tsx` | Add `handleRenameTrack`, pass to modal |

## Gotchas / Notes

1. **Empty title** — Don't allow empty title. If user clears it, revert to `fileName` on blur.

2. **Null vs empty string** — Artist can be null (unknown). Empty string should become null in the database.

3. **Keyboard behavior** — `onSubmitEditing` saves and moves focus. `onBlur` saves when tapping elsewhere.

4. **Edit icon** — Small pencil icon next to text hints it's editable. Use `FontAwesome name="pencil"`.

5. **No file rename** — We're renaming the metadata (title/artist), not the actual file. The `fileName` stays the same.

6. **Update reflected immediately** — The store update is optimistic, so the modal should reflect the change instantly.

---

*Handed off by Vaelthrix the Astral*
