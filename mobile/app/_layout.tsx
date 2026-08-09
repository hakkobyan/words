import '../global.css';
import { useEffect, useSyncExternalStore } from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { colorScheme } from 'nativewind';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { useIsDarkTheme, useThemeColors } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { RealInsetsProvider } from '@/lib/insets';
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
  const isDark = useIsDarkTheme();
  const { pick } = useI18n();

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

  // Without these the header keeps its platform default — a light grey bar that
  // ignores the theme — and the titles were hardcoded Russian regardless of the
  // interface language.
  const header = {
    headerShown: true,
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.green,
    headerTitleStyle: { color: colors.ink, fontWeight: '700' as const },
    headerShadowVisible: false,
  };

  return (
    <RealInsetsProvider>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="categories/index" options={{ ...header, title: pick('Категории', 'Categories') }} />
        <Stack.Screen name="categories/[categoryId]" options={{ ...header, title: '' }} />
        <Stack.Screen name="sessions" options={{ ...header, title: pick('Сеансы', 'Sessions') }} />
        <Stack.Screen name="settings" options={{ ...header, title: pick('Настройки', 'Settings') }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
      </Stack>
    </RealInsetsProvider>
  );
}
