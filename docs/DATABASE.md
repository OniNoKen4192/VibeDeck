# VibeDeck Database Patterns

> Documented by Wrixle the Copper — 2026-01-09

This document covers SQLite usage patterns in VibeDeck. For schema and entity definitions, see [DATAMODEL.md](DATAMODEL.md).

---

## Database Access

VibeDeck uses `expo-sqlite` for all persistence. The database is initialized in `src/db/init.ts` and query functions live in `src/db/queries/`.

```typescript
import { getDatabase } from '../db/init';

const db = getDatabase();
```

---

## Transaction Patterns

### When to Use Transactions

Use `db.withTransactionAsync()` for any operation that:

1. **Modifies multiple rows atomically** — All changes succeed or none do
2. **Requires read-then-write consistency** — Prevents race conditions between read and write
3. **Involves cascading changes** — Related data must stay in sync

### Basic Pattern

```typescript
await db.withTransactionAsync(async () => {
  // All operations here are atomic
  await db.runAsync('DELETE FROM ...', [...]);
  await db.runAsync('INSERT INTO ...', [...]);
  // If any statement fails, all are rolled back
});
```

### Example: Replacing All Tags for a Track

From `src/db/queries/trackTags.ts`:

```typescript
export async function setTagsForTrack(trackId: string, tagIds: string[]): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    // Step 1: Remove all existing associations
    await db.runAsync('DELETE FROM track_tags WHERE track_id = ?', [trackId]);

    // Step 2: Add new associations
    for (const tagId of tagIds) {
      await db.runAsync(
        `INSERT INTO track_tags (track_id, tag_id, created_at) VALUES (?, ?, ?)`,
        [trackId, tagId, now]
      );
    }
  });
}
```

**Why a transaction?** Without it, a failure during insert would leave the track with missing tags. The transaction ensures the operation is all-or-nothing.

### Example: Reordering Buttons

From `src/db/queries/buttons.ts`:

```typescript
export async function reorderButtons(orderedIds: string[]): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.runAsync(
        'UPDATE buttons SET position = ?, updated_at = ? WHERE id = ?',
        [i, now, orderedIds[i]]
      );
    }
  });
}
```

**Why a transaction?** Position values must be consistent. A partial reorder would leave buttons with duplicate or incorrect positions.

---

## Error Handling

### Transaction Errors

Transactions automatically roll back on error. Catch and handle in the calling code:

```typescript
try {
  await setTagsForTrack(trackId, newTagIds);
} catch (error) {
  // Transaction was rolled back
  // Show user feedback, reload state, etc.
}
```

### Store-Level Rollback

Zustand stores that use optimistic updates handle DB failures by reloading from the database. See [Store Patterns](#store-patterns) below.

---

## Store Patterns

### Optimistic Updates with Rollback

For responsive UI, stores update state immediately and persist asynchronously. If persistence fails, state is restored from database.

**Pattern:**
```typescript
const previousState = get().items;
set({ items: updatedItems }); // Optimistic

try {
  await dbOperation();
} catch (error) {
  await get().loadItems(); // Rollback via reload
  throw error;
}
```

**Examples:**
- `useTagStore.addTagToTrack()` — Updates counts optimistically
- `usePlayerStore.setVolume()` — Saves previous value, restores on failure

### Cross-Store Refresh

When one store's mutation affects another store's data, the mutating store triggers a reload:

```typescript
// In useTrackStore.deleteTrack():
await trackQueries.deleteTrack(id);
set((state) => ({ tracks: state.tracks.filter((t) => t.id !== id) }));

// Trigger cross-store refresh
const { useTagStore } = await import('./useTagStore');
const { useButtonStore } = await import('./useButtonStore');
useTagStore.getState().loadTags();     // Tag counts changed
useButtonStore.getState().loadButtons(); // Orphaned buttons changed
```

**Dynamic imports** are used to avoid circular dependencies between stores.

---

## Atomic Insertion

For position-based ordering, use atomic insert patterns to prevent race conditions:

```typescript
// From src/db/queries/buttons.ts
export async function insertButtonAtomic(button: Omit<Button, 'position'>): Promise<number> {
  await db.runAsync(
    `INSERT INTO buttons (..., position, ...)
     SELECT ?, ?, ..., COALESCE(MAX(position), -1) + 1, ...
     FROM buttons`,
    [...]
  );
  // Position is calculated in the same INSERT, no race window
}
```

---

## Common Queries

### Getting Counts with JOINs

```typescript
// Tags with track counts
const tags = await db.getAllAsync(`
  SELECT t.*,
         COUNT(tt.track_id) as track_count,
         SUM(CASE WHEN tr.played = 0 THEN 1 ELSE 0 END) as unplayed_count
  FROM tags t
  LEFT JOIN track_tags tt ON t.id = tt.tag_id
  LEFT JOIN tracks tr ON tt.track_id = tr.id
  GROUP BY t.id
`);
```

### Batch Resolution (Avoiding N+1)

Rather than resolving each button individually, use a single query with JOINs:

```typescript
// See src/db/queries/buttons.ts: getAllButtonsResolved()
const rows = await db.getAllAsync(`
  SELECT b.*, t.name as tag_name, tr.title as track_title, ...
  FROM buttons b
  LEFT JOIN tags t ON b.tag_id = t.id
  LEFT JOIN tracks tr ON b.track_id = tr.id
`);
```

---

## File Structure

```
src/db/
  init.ts           # Database initialization
  schema.ts         # Schema definition and migrations
  queries/
    tracks.ts       # Track CRUD
    tags.ts         # Tag CRUD
    trackTags.ts    # Track-tag associations
    buttons.ts      # Button CRUD and resolution
    settings.ts     # Key-value settings storage
```

---

## Best Practices

1. **Always use parameterized queries** — Never interpolate user data into SQL strings
2. **Use transactions for multi-step operations** — Ensures atomicity
3. **Handle errors at the store level** — DB errors should trigger state reload
4. **Prefer batch queries over loops** — Reduces round-trips
5. **Test edge cases** — Empty results, duplicate inserts, concurrent access
