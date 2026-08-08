import {useColorScheme} from 'nativewind';

const light={ink:'#291f1a',muted:'#6f5f56',paper:'#f3ebe2',paper2:'#e8ddd1',card:'#fffbf6',cardStrong:'#ffffff',green:'#65483a',mint:'#ead9ca',orange:'#bd704d',line:'#d9c9bb',danger:'#a23f36',success:'#47654c',placeholder:'#76655c'};
const dark={ink:'#f7eee6',muted:'#c7b3a5',paper:'#191513',paper2:'#26201d',card:'#2a231f',cardStrong:'#332a25',green:'#e0b69f',mint:'#46342b',orange:'#e29a74',line:'#514038',danger:'#ef8f85',success:'#9fc0a4',placeholder:'#bca79b'};

export function useThemeColors(){
  const {colorScheme}=useColorScheme();
  return colorScheme==='dark'?dark:light;
}

export function useIsDarkTheme(){
  const {colorScheme}=useColorScheme();
  return colorScheme==='dark';
}

/** Same colour, made see-through — for surfaces that blur what is behind them. */
export function withAlpha(hex:string,alpha:number){
  const value=hex.replace('#','');
  const r=parseInt(value.slice(0,2),16),g=parseInt(value.slice(2,4),16),b=parseInt(value.slice(4,6),16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
