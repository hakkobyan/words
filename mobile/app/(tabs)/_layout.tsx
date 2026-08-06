import { router, Tabs } from 'expo-router';
import { Brain, Home, Library, Menu, Plus, Tv } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';
import { useThemeColors } from '@/lib/theme';

const icons = { index: Home, words: Library, add: Plus, youtube: Tv, study: Brain } as const;

function tabLabel(routeName: string, t: (key: 'home' | 'words' | 'add' | 'study') => string) {
  if (routeName === 'index') return t('home');
  if (routeName === 'youtube') return 'YouTube';
  return t(routeName as 'words' | 'add' | 'study');
}

function CustomTabBar({ state, navigation }: { state: { routes: { key: string; name: string }[]; index: number }; navigation: { navigate: (name: string) => void } }) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { t } = useI18n();
  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row justify-around border-t bg-card border-line px-1 pt-2"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isAdd = route.name === 'add';
        const Icon = icons[route.name as keyof typeof icons];
        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityLabel={tabLabel(route.name, t)}
            onPress={() => navigation.navigate(route.name)}
            className="flex-1 items-center gap-1 py-1"
          >
            <View className={isAdd ? 'bg-primary-bg rounded-2xl p-3 -mt-7' : ''} style={isAdd ? { shadowColor: '#4f3026', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, elevation: 4 } : undefined}>
              <Icon size={isAdd ? 25 : 20} color={isAdd ? '#fffaf4' : isFocused ? colors.green : colors.muted} />
            </View>
            <Text style={{ color: isFocused ? colors.green : colors.muted, fontWeight: isFocused ? '700' : '400', fontSize: 10 }}>
              {tabLabel(route.name, t)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  return (
    <View className="flex-1 bg-paper">
      <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="words" />
        <Tabs.Screen name="add" />
        <Tabs.Screen name="youtube" />
        <Tabs.Screen name="study" />
      </Tabs>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ещё"
        onPress={() => router.push('/settings')}
        className="absolute right-4 rounded-full p-2.5 bg-card border border-line"
        style={{ top: insets.top + 12 }}
      >
        <Menu size={20} color={colors.muted} />
      </Pressable>
    </View>
  );
}
