/**
 * @file types/index.ts
 * @description Core entity type definitions for VibeDeck domain objects.
 * Defines Track, Tag, Button, and derived UI types used throughout the application.
 */

// Core entity types

export interface Track {
  id: string;
  filePath: string;
  fileName: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  genre: string | null;
  durationMs: number | null;
  played: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrackTag {
  trackId: string;
  tagId: string;
  createdAt: string;
}

export type ButtonType = 'tag' | 'direct';

export interface Button {
  id: string;
  name: string;
  type: ButtonType;
  tagId: string | null;
  trackId: string | null;
  position: number;
  persistent: boolean;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

// Derived types for UI

export interface TrackWithTags extends Track {
  tags: Tag[];
}

export interface TagWithCount extends Tag {
  trackCount: number;
  unplayedCount: number;
}

export interface ButtonResolved extends Button {
  // For tag buttons
  tag?: Tag;
  availableTracks?: number; // unplayed count
  totalTracks?: number; // total tracks (for empty tag detection)
  // For direct buttons
  track?: Track;
  // Computed
  displayColor: string; // resolved from button.color ?? tag.color ?? default
  isDisabled: boolean; // e.g., direct button with deleted track, or tag with no tracks
  isEmpty?: boolean; // true if tag button has zero tracks assigned
}

// Session state types

export interface SessionState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number; // 0-100
  selectedOutputDevice: string | null;
}
