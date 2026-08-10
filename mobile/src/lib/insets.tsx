import {createContext, useContext} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * The real safe-area insets, kept reachable after the tab navigator has been
 * handed zeroes.
 *
 * React Navigation insets each screen by the safe area. We keep the navigator
 * full-height and add the real values to screen padding ourselves so the solid
 * notch surface and floating home-indicator menu can be rendered consistently.
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
