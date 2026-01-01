export interface Song {
  id: string;
  title: string;
  artist: string;
  tags: string[];
  fileUri: string;
  duration?: number;
  addedAt: number;
}

export interface TagGroup {
  tag: string;
  playedSongIds: string[];
}

export interface PlaybackState {
  songId: string;
  tagGroup: string;
  startedAt: number;
}

export interface AppSettings {
  volume: number;
  goalHornUri: string | null;
  fadeOutDuration: number;
}
