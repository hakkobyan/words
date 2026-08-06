/**
 * react-native-web turns a `dataSet` prop into data-* attributes, which lets a
 * stylesheet reach a component that React Native itself cannot express — here,
 * the real safe-area insets. React Native's own types do not declare the prop,
 * so it is passed through this cast. On native it is simply ignored.
 */
export const dataSet = (data: Record<string, string>) => ({dataSet: data}) as object;
