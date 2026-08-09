import {useColorScheme} from 'nativewind';

const light={ink:'#2b2523',muted:'#786b65',paper:'#faf7f2',paper2:'#f3ede6',card:'#ffffff',cardStrong:'#fffdfb',plum:'#765d74',lilac:'#f1e8f0',orange:'#d27c58',line:'#e8ded5',danger:'#a23f36',success:'#626b82',placeholder:'#8b7c75',onPrimary:'#fffaf4',heroBg:'#5d465b',heroText:'#fff9f4',heroActionBg:'#fffaf6',heroActionText:'#4c374a'};
const dark={ink:'#f7f1eb',muted:'#bdaea5',paper:'#171412',paper2:'#24201d',card:'#29231f',cardStrong:'#332b26',plum:'#c8b2cf',lilac:'#3d3040',orange:'#e09a75',line:'#493e37',danger:'#ef8f85',success:'#bec0da',placeholder:'#bca79b',onPrimary:'#221713',heroBg:'#704536',heroText:'#fffaf4',heroActionBg:'#fffaf3',heroActionText:'#4f3026'};

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
