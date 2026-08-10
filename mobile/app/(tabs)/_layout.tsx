import { router, Tabs } from 'expo-router';
import { Brain, Home, Library, Menu, Plus, Tv } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';
import { useThemeColors } from '@/lib/theme';
import { dataSet } from '@/lib/web';
import { useRealInsets } from '@/lib/insets';

const ZERO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };

const icons = { index: Home, words: Library, add: Plus, youtube: Tv, study: Brain } as const;

function tabLabel(routeName: string, t: (key: 'home' | 'words' | 'add' | 'study') => string) {
  if (routeName === 'index') return t('home');
  if (routeName === 'youtube') return 'YouTube';
  return t(routeName as 'words' | 'add' | 'study');
}

function CustomTabBar({ state, navigation }: { state: { routes: { key: string; name: string }[]; index: number }; navigation: { navigate: (name: string) => void } }) {
  const insets = useRealInsets();
  const colors = useThemeColors();
  const { t } = useI18n();
  return (
    // Matches the original web shell from f3b6894: a solid floating card with
    // an 8px outer edge, while the home-indicator inset stays inside the card.
    <View
      style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 18,
        backgroundColor: colors.card,
      }}
    >
      <View
        // data-safe-bottom lets the stylesheet supply the real inset on web,
        // where the safe-area library reports zero.
        {...dataSet({ safeBottom: 'true' })}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 4,
          paddingTop: 8,
          // Carries the bar's surface through the home-indicator area, so the
          // strip below it reads as part of the menu rather than the page.
          paddingBottom: insets.bottom + 8,
          backgroundColor: colors.card,
        }}
      >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isAdd = route.name === 'add';
        const Icon = icons[route.name as keyof typeof icons];
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={tabLabel(route.name, t)}
            accessibilityState={{selected:isFocused}}
            onPress={() => navigation.navigate(route.name)}
            className="flex-1 items-center gap-1 py-1"
          >
            <View className={isAdd?'bg-primary-bg rounded-2xl p-3 -mt-7':''} style={isAdd?{elevation:4}:undefined}>
              <Icon size={isAdd?25:20} color={isAdd?colors.onPrimary:isFocused?colors.green:colors.muted}/>
            </View>
            <Text style={{color:isFocused?colors.green:colors.muted,fontWeight:isFocused?'700':'400',fontSize:10}}>
              {tabLabel(route.name, t)}
            </Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useRealInsets();
  const colors = useThemeColors();
  return (
    <View className="flex-1 bg-paper">
      {/* Zeroed for the navigator only: screens add the real inset to their own
          scroll padding while this layout paints the notch and home-indicator
          surfaces itself — see useRealInsets. */}
      <SafeAreaInsetsContext.Provider value={ZERO_INSETS}>
        <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="words" />
          <Tabs.Screen name="add" />
          <Tabs.Screen name="youtube" />
          <Tabs.Screen name="study" />
        </Tabs>
      </SafeAreaInsetsContext.Provider>
      {/* f3b6894 used the page background around the iOS browser chrome. Keep
          that same solid surface behind the notch instead of a tinted blur. */}
      {/* Rendered even when the inset reads zero: on web the stylesheet gives it
          the real height, and a zero-height strip is simply invisible. */}
      <View
        pointerEvents="none"
        {...dataSet({ safeTop: 'true' })}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, zIndex: 10, backgroundColor: colors.paper }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ещё"
        onPress={() => router.push('/settings')}
        {...dataSet({ safeTopOffset: 'true' })}
        className="absolute right-4 rounded-full p-2.5 bg-card border border-line"
        style={{ top: insets.top + 12, zIndex: 20 }}
      >
        <Menu size={20} color={colors.muted} />
      </Pressable>
    </View>
  );
}
