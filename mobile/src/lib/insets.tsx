import {createContext, useContext} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * The real safe-area insets, kept reachable after the tab navigator has been
 * handed zeroes.
 *
 * React Navigation insets each screen by the safe area, which stops content
 * from ever passing under the status bar — so the strip there has nothing to
 * blur and reads as a solid block. Screens are given the full height instead
 * and add the inset to their scroll padding, which puts the content back where
 * it was while letting it slide underneath as you scroll.
 */
const RealInsets = createContext({top: 0, bottom: 0});

export function RealInsetsProvider({children}: {children: React.ReactNode}) {
  const insets = useSafeAreaInsets();
  return <RealInsets.Provider value={{top: insets.top, bottom: insets.bottom}}>{children}</RealInsets.Provider>;
}

export const useRealInsets = () => useContext(RealInsets);

/** Height of the tab bar itself, before its safe-area padding. */
export const TAB_BAR_HEIGHT = 62;

const EDGE = 20;

/**
 * Scroll padding for a tab screen: clears the status bar at the top and the
 * menu at the bottom, while leaving the content free to scroll under both.
 */
export function useScreenPadding() {
  const insets = useRealInsets();
  return {paddingTop: insets.top + EDGE, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + EDGE};
}

/** Safe padding for full-screen flows that do not render the tab bar. */
export function useStandaloneScreenPadding(edge = EDGE) {
  const insets = useRealInsets();
  return {paddingTop: insets.top + edge, paddingBottom: insets.bottom + edge};
}
