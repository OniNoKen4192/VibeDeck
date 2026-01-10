/**
 * @file jest.setup.js
 * @description Jest setup file with global mocks for native modules.
 */

// Note: @testing-library/react-native v13+ has matchers built in via jest-expo preset

// Silence the warning: Animated: `useNativeDriver` is not supported
// Note: jest-expo preset handles this automatically, so we just suppress console warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('useNativeDriver')) return;
  originalWarn(...args);
};

// Mock react-native-track-player
jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    setupPlayer: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    add: jest.fn().mockResolvedValue(undefined),
    reset: jest.fn().mockResolvedValue(undefined),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    seekTo: jest.fn().mockResolvedValue(undefined),
    setVolume: jest.fn().mockResolvedValue(undefined),
    getVolume: jest.fn().mockResolvedValue(1),
    getPosition: jest.fn().mockResolvedValue(0),
    getDuration: jest.fn().mockResolvedValue(0),
    getState: jest.fn().mockResolvedValue(0),
    addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  },
  Event: {
    PlaybackState: 'playback-state',
    PlaybackError: 'playback-error',
    PlaybackActiveTrackChanged: 'playback-active-track-changed',
  },
  State: {
    None: 0,
    Ready: 1,
    Playing: 2,
    Paused: 3,
    Stopped: 4,
    Buffering: 5,
    Error: 6,
  },
  Capability: {
    Play: 'play',
    Pause: 'pause',
    Stop: 'stop',
    SeekTo: 'seek-to',
  },
  usePlaybackState: jest.fn().mockReturnValue({ state: 0 }),
  useProgress: jest.fn().mockReturnValue({ position: 0, duration: 0, buffered: 0 }),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/documents/',
  cacheDirectory: 'file:///mock/cache/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, isDirectory: false }),
  readAsStringAsync: jest.fn().mockResolvedValue(''),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-file-system/next (File class API)
jest.mock('expo-file-system/next', () => ({
  File: jest.fn().mockImplementation((path) => ({
    uri: path,
    exists: true,
  })),
}));

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///mock/document.mp3', name: 'document.mp3' }],
  }),
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
    closeAsync: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mock-uuid-1234-5678-9abc-def012345678'),
}));

// Mock custom SAF permissions module
jest.mock('./modules/expo-saf-uri-permission', () => ({
  takePersistablePermission: jest.fn().mockResolvedValue(undefined),
  releasePersistablePermission: jest.fn().mockResolvedValue(undefined),
}));
