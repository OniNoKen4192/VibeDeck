/**
 * @file constants/audio.ts
 * @description Audio-related constants including supported formats and volume defaults.
 */

export const Audio = {
  // Supported audio formats
  supportedFormats: ['.mp3', '.m4a', '.wav', '.ogg', '.flac', '.aac'],

  // Default volume (0-100)
  defaultVolume: 80,

  // Volume step for increment/decrement
  volumeStep: 10,
};
