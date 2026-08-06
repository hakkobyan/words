import '../global.css';
import { useEffect, useSyncExternalStore } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { colorScheme } from 'nativewind';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { useThemeColors } from '@/lib/theme';
import { dailySession } from '@/lib/dailyWords';
import Onboarding from '@/components/onboarding/Onboarding';
import DailyWords from '@/components/daily/DailyWords';

export default function RootLayout() {
  const hydrate = useVocabularyStore((s) => s.hydrate);
  const theme = useVocabularyStore((s) => s.settings.theme);
  const isHydrated = useVocabularyStore((s) => s.isHydrated);
  const onboardingCompleted = useVocabularyStore((s) => s.settings.onboardingCompleted);
  const dailyDone = useSyncExternalStore(dailySession.subscribe, dailySession.isHandled, dailySession.isHandled);
  const systemScheme = useColorScheme();
  const colors = useThemeColors();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Resolve "system" ourselves rather than passing it through: the web build
    // styles dark mode off a class, and NativeWind sets no class for "system",
    // which left the site light on a dark OS.
    colorScheme.set(theme === 'system' ? (systemScheme ?? 'light') : theme);
  }, [theme, systemScheme]);

  useEffect(() => {
    // Colours the browser chrome around the page — the strips behind the status
    // bar and the home indicator — to match the theme in use.
    if (Platform.OS !== 'web') return;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors.paper);
  }, [colors.paper]);

  if (isHydrated && !onboardingCompleted) return <Onboarding />;
  if (isHydrated && !dailyDone) return <DailyWords onDone={dailySession.markHandled} />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="categories/index" options={{ headerShown: true, title: 'Категории' }} />
      <Stack.Screen name="categories/[categoryId]" options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="sessions" options={{ headerShown: true, title: 'Сеансы' }} />
      <Stack.Screen name="settings" options={{ headerShown: true, title: 'Настройки' }} />
    </Stack>
  );
}
