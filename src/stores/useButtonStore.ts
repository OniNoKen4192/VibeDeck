/**
 * @file stores/useButtonStore.ts
 * @description Zustand store for button board management including tag and direct buttons.
 */

import { create } from 'zustand';
import type { Button, ButtonType, ButtonResolved, Tag, Track } from '../types';
import { generateUUID } from '../utils/uuid';
import { validateButtonName } from '../utils/validation';
import { DEFAULT_BUTTON_COLOR } from '../constants/colors';
import * as buttonQueries from '../db/queries/buttons';
import * as tagQueries from '../db/queries/tags';
import * as trackQueries from '../db/queries/tracks';
import * as trackTagQueries from '../db/queries/trackTags';

/**
 * Button store interface
 *
 * @remarks For UI:
 * - `buttons`: Raw button data (use resolveAllButtons for rendering)
 * - `addTagButton`: Wire to "Add Tag Button" in button creation flow
 * - `addDirectButton`: Wire to "Add Direct Button" in button creation flow
 * - `reorderButtons`: Wire to drag-and-drop reordering
 * - `resolveButton/resolveAllButtons`: Get display-ready data with colors & counts
 *
 * @example Creating a tag button:
 * ```typescript
 * // From "Create Button" modal:
 * const handleCreate = async () => {
 *   await buttonStore.addTagButton(
 *     name,           // User-entered button label
 *     selectedTagId,  // From tag picker
 *     isPersistent,   // Checkbox for "always visible"
 *     selectedColor   // Optional color override
 *   );
 * };
 * ```
 */
interface ButtonStore {
  /** Raw button data. Use resolveAllButtons() for rendering. */
  buttons: Button[];
  /** True while loading from database */
  isLoading: boolean;

  // Actions
  /** Load all buttons from database. Call on app startup. */
  loadButtons: () => Promise<void>;
  /** Create a tag button linked to a tag. */
  addTagButton: (name: string, tagId: string, persistent?: boolean, color?: string | null) => Promise<Button>;
  /** Create a direct button linked to a specific track. */
  addDirectButton: (name: string, trackId: string, persistent?: boolean, color?: string | null) => Promise<Button>;
  /** Update button properties (name, color, persistent flag). */
  updateButton: (id: string, updates: Partial<Pick<Button, 'name' | 'persistent' | 'color'>>) => Promise<void>;
  /** Delete a button from the board. */
  deleteButton: (id: string) => Promise<void>;
  /** Remove all buttons associated with a tag. Used for cascade on tag deletion. */
  removeButtonsForTag: (tagId: string) => Promise<void>;
  /** Reorder buttons. Pass array of IDs in desired order. */
  reorderButtons: (orderedIds: string[]) => Promise<void>;

  // Helpers
  /** Get raw button by ID. */
  getButtonById: (id: string) => Button | undefined;
  /** Resolve a single button to UI-ready format with colors and counts. */
  resolveButton: (button: Button) => Promise<ButtonResolved>;
  /** Resolve all buttons. Use this for rendering the button board grid. */
  resolveAllButtons: () => Promise<ButtonResolved[]>;
}

export const useButtonStore = create<ButtonStore>((set, get) => ({
  buttons: [],
  isLoading: false,

  loadButtons: async () => {
    set({ isLoading: true });
    try {
      const buttons = await buttonQueries.getAllButtons();
      set({ buttons });
    } finally {
      set({ isLoading: false });
    }
  },

  addTagButton: async (name, tagId, persistent = false, color = null) => {
    // Validate button name
    const validation = validateButtonName(name);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const now = new Date().toISOString();
    const id = generateUUID();
    const trimmedName = name.trim();

    // Use atomic insert to prevent position race conditions
    const position = await buttonQueries.insertButtonAtomic({
      id,
      name: trimmedName,
      type: 'tag',
      tagId,
      trackId: null,
      persistent,
      color,
      createdAt: now,
      updatedAt: now,
    });

    const button: Button = {
      id,
      name: trimmedName,
      type: 'tag',
      tagId,
      trackId: null,
      position,
      persistent,
      color,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({ buttons: [...state.buttons, button] }));
    return button;
  },

  addDirectButton: async (name, trackId, persistent = false, color = null) => {
    // Validate button name
    const validation = validateButtonName(name);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const now = new Date().toISOString();
    const id = generateUUID();
    const trimmedName = name.trim();

    // Use atomic insert to prevent position race conditions
    const position = await buttonQueries.insertButtonAtomic({
      id,
      name: trimmedName,
      type: 'direct',
      tagId: null,
      trackId,
      persistent,
      color,
      createdAt: now,
      updatedAt: now,
    });

    const button: Button = {
      id,
      name: trimmedName,
      type: 'direct',
      tagId: null,
      trackId,
      position,
      persistent,
      color,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({ buttons: [...state.buttons, button] }));
    return button;
  },

  updateButton: async (id, updates) => {
    // Validate button name if provided
    if (updates.name !== undefined) {
      const validation = validateButtonName(updates.name);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      updates = { ...updates, name: updates.name.trim() };
    }

    const now = new Date().toISOString();
    await buttonQueries.updateButton(id, { ...updates, updatedAt: now });
    set((state) => ({
      buttons: state.buttons.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: now } : b
      ),
    }));
  },

  deleteButton: async (id) => {
    await buttonQueries.deleteButton(id);
    set((state) => ({
      buttons: state.buttons.filter((b) => b.id !== id),
    }));
  },

  removeButtonsForTag: async (tagId) => {
    await buttonQueries.deleteButtonsByTagId(tagId);
    set((state) => ({
      buttons: state.buttons.filter((b) => b.tagId !== tagId),
    }));
  },

  reorderButtons: async (orderedIds) => {
    await buttonQueries.reorderButtons(orderedIds);
    const now = new Date().toISOString();
    set((state) => {
      const buttonMap = new Map(state.buttons.map((b) => [b.id, b]));
      const reordered = orderedIds
        .map((id, index) => {
          const button = buttonMap.get(id);
          return button ? { ...button, position: index, updatedAt: now } : null;
        })
        .filter((b): b is Button => b !== null);
      return { buttons: reordered };
    });
  },

  getButtonById: (id) => {
    return get().buttons.find((b) => b.id === id);
  },

  resolveButton: async (button) => {
    let tag: Tag | undefined;
    let track: Track | undefined;
    let availableTracks: number | undefined;
    let isDisabled = false;

    if (button.type === 'tag' && button.tagId) {
      const tagResult = await tagQueries.getTagById(button.tagId);
      if (tagResult) {
        tag = tagResult;
        const unplayed = await trackTagQueries.getUnplayedTracksForTag(button.tagId);
        availableTracks = unplayed.length;
      } else {
        isDisabled = true; // Tag was deleted
      }
    } else if (button.type === 'direct' && button.trackId) {
      const trackResult = await trackQueries.getTrackById(button.trackId);
      if (trackResult) {
        track = trackResult;
      } else {
        isDisabled = true; // Track was deleted
      }
    }

    // Resolve display color: button.color ?? tag.color ?? default
    const displayColor = button.color ?? tag?.color ?? DEFAULT_BUTTON_COLOR;

    return {
      ...button,
      tag,
      track,
      availableTracks,
      displayColor,
      isDisabled,
    };
  },

  resolveAllButtons: async () => {
    const rows = await buttonQueries.getAllButtonsResolved();
    return rows.map(buttonQueries.rowToButtonResolved);
  },
}));
