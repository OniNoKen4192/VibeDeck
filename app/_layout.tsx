import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, createContext, useContext } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { initDatabase } from '../src/db/init';
import {
  initializePlayer,
  destroyPlayer,
  applyVolume,
} from '../src/services/player';
import { usePlayerStore } from '../src/stores/usePlayerStore';
import { useTrackStore } from '../src/stores/useTrackStore';
import { useButtonStore } from '../src/stores/useButtonStore';
import { useTagStore } from '../src/stores/useTagStore';

/**
 * Context for app initialization state.
 * Consumers can check if stores and player are ready.
 */
export const AppReadyContext = createContext<boolean>(false);

/**
 * Hook to check if the app has finished initialization.
 */
export function useAppReady(): boolean {
  return useContext(AppReadyContext);
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [appReady, setAppReady] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Initialize app services: database, player, and stores
  useEffect(() => {
    let mounted = true;

    async function initializeApp() {
      try {
        // Initialize database first
        await initDatabase();

        // Initialize audio player
        await initializePlayer();

        // Load persisted state and data from stores
        await usePlayerStore.getState().loadPersistedState();
        await useTrackStore.getState().loadTracks();
        await useTagStore.getState().loadTags();
        await useButtonStore.getState().loadButtons();

        // Apply persisted volume to player
        const volume = usePlayerStore.getState().volume;
        await applyVolume(volume);

        if (mounted) {
          setAppReady(true);
        }
      } catch (err) {
        console.error('[RootLayout] Failed to initialize app:', err);
        // Still mark as ready to allow error display
        if (mounted) {
          setAppReady(true);
        }
      }
    }

    initializeApp();

    return () => {
      mounted = false;
      destroyPlayer();
    };
  }, []);

  // Hide splash when fonts are loaded AND app is initialized
  useEffect(() => {
    if (loaded && appReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, appReady]);

  if (!loaded || !appReady) {
    return null;
  }

  return (
    <AppReadyContext.Provider value={appReady}>
      <RootLayoutNav />
    </AppReadyContext.Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
