/**
 * Navigation type definitions for Expo Router
 */

export type RootStackParamList = {
  '(tabs)': undefined;
  'track/[id]': { id: string };
  'button/new': undefined;
  'button/[id]': { id: string };
  settings: undefined;
};

export type TabParamList = {
  index: undefined; // Button Board
  library: undefined;
  tags: undefined;
};
