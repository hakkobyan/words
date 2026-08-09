import {useColorScheme} from 'nativewind';

const light={ink:'#241c18',muted:'#75655c',paper:'#f6efe7',paper2:'#ede3d8',card:'#fffcf8',cardStrong:'#ffffff',green:'#496457',mint:'#e2ece5',orange:'#c97852',line:'#ded0c4',danger:'#a23f36',success:'#47654c',placeholder:'#76655c',onPrimary:'#fffaf4'};
const dark={ink:'#f7f1eb',muted:'#bdaea5',paper:'#171412',paper2:'#24201d',card:'#29231f',cardStrong:'#332b26',green:'#a8c1ae',mint:'#304039',orange:'#e09a75',line:'#493e37',danger:'#ef8f85',success:'#9fc0a4',placeholder:'#bca79b',onPrimary:'#221713'};

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
