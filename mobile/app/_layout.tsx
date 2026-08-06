import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { colorScheme } from 'nativewind';
import { useVocabularyStore } from '@/store/useVocabularyStore';

export default function RootLayout() {
  const hydrate = useVocabularyStore((s) => s.hydrate);
  const theme = useVocabularyStore((s) => s.settings.theme);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    colorScheme.set(theme);
  }, [theme]);

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
