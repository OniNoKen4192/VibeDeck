/**
 * @file index.js
 * @description Custom entry point for Expo Router with TrackPlayer service registration.
 */

import TrackPlayer from 'react-native-track-player';

// Register playback service BEFORE React renders
// This is required by react-native-track-player
TrackPlayer.registerPlaybackService(() => require('./src/services/player/playbackService'));

// Import Expo Router entry point
import 'expo-router/entry';
