import '../global.css';
import { useEffect, useSyncExternalStore } from 'react';
import { Stack } from 'expo-router';
import { colorScheme } from 'nativewind';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { dailySession } from '@/lib/dailyWords';
import Onboarding from '@/components/onboarding/Onboarding';
import DailyWords from '@/components/daily/DailyWords';

export default function RootLayout() {
  const hydrate = useVocabularyStore((s) => s.hydrate);
  const theme = useVocabularyStore((s) => s.settings.theme);
  const isHydrated = useVocabularyStore((s) => s.isHydrated);
  const onboardingCompleted = useVocabularyStore((s) => s.settings.onboardingCompleted);
  const dailyDone = useSyncExternalStore(dailySession.subscribe, dailySession.isHandled, dailySession.isHandled);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    colorScheme.set(theme);
  }, [theme]);

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
