/**
 * @file services/player/playbackService.ts
 * @description Background playback service for react-native-track-player.
 * Must be registered at app entry before React renders.
 */

import TrackPlayer, { Event } from 'react-native-track-player';

/**
 * Playback service that handles remote events (notification controls, etc.)
 * Required by react-native-track-player for proper initialization.
 */
module.exports = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));
};
