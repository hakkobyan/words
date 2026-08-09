import { router, Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Brain, Home, Library, Menu, Plus, Tv } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';
import { useIsDarkTheme, useThemeColors, withAlpha } from '@/lib/theme';
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
  const isDark = useIsDarkTheme();
  const { t } = useI18n();
  return (
    // Blur underneath, the app's own colour layered on top: BlurView paints its
    // own generic tint and would otherwise override any backgroundColor given
    // to it, leaving the bar grey instead of matching the menu surface.
    // Styled inline rather than with className — NativeWind only maps classes
    // onto components it has been taught about, and BlurView is not one.
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: colors.line }}>
      <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View
        // data-safe-bottom lets the stylesheet supply the real inset on web,
        // where the safe-area library reports zero.
        {...dataSet({ safeBottom: 'true' })}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 8,
          paddingTop: 9,
          // Carries the bar's surface through the home-indicator area, so the
          // strip below it reads as part of the menu rather than the page.
          paddingBottom: insets.bottom + 8,
          backgroundColor: withAlpha(colors.card, isDark ? 0.7 : 0.75),
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
            className="min-h-14 flex-1 items-center justify-center gap-1 py-1"
          >
            <View className={isAdd?'bg-primary-bg rounded-[18px] w-14 h-14 -mt-7 items-center justify-center':isFocused?'bg-mint rounded-xl w-12 h-8 items-center justify-center':'w-12 h-8 items-center justify-center'} style={isAdd?{elevation:4}:undefined}>
              <Icon size={isAdd?24:20} strokeWidth={isFocused?2.4:1.8} color={isAdd?colors.onPrimary:isFocused?colors.green:colors.muted}/>
            </View>
            <Text style={{color:isFocused?colors.green:colors.muted,fontWeight:isFocused?'700':'500',fontSize:11}}>
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
  const isDark = useIsDarkTheme();
  return (
    <View className="flex-1 bg-paper">
      {/* Zeroed for the navigator only: otherwise it insets every screen by the
          safe area, so nothing ever passes under the status bar and the strip
          there has nothing to blur. Screens add the inset to their own scroll
          padding instead — see useRealInsets. */}
      <SafeAreaInsetsContext.Provider value={ZERO_INSETS}>
        <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="words" />
          <Tabs.Screen name="add" />
          <Tabs.Screen name="youtube" />
          <Tabs.Screen name="study" />
        </Tabs>
      </SafeAreaInsetsContext.Provider>
      {/* Content scrolls beneath the status bar; this frosts it rather than
          hiding it behind a solid block. */}
      {/* Rendered even when the inset reads zero: on web the stylesheet gives it
          the real height, and a zero-height strip is simply invisible. */}
      <View
        pointerEvents="none"
        {...dataSet({ safeTop: 'true' })}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, zIndex: 10 }}
      >
        <BlurView intensity={75} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={{ flex: 1, backgroundColor: withAlpha(colors.paper, isDark ? 0.16 : 0.22) }} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ещё"
        onPress={() => router.push('/settings')}
        {...dataSet({ safeTopOffset: 'true' })}
        className="absolute right-5 w-12 h-12 items-center justify-center rounded-full bg-card border border-line"
        style={{ top: insets.top + 12, zIndex: 20, elevation: 6 }}
      >
        <Menu size={20} color={colors.muted} />
      </Pressable>
    </View>
  );
}
