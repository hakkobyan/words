import {useColorScheme} from 'nativewind';

const light={ink:'#291f1a',muted:'#6f5f56',paper:'#efe5d8',paper2:'#e4d5c5',card:'#fffaf3',cardStrong:'#ffffff',green:'#704838',mint:'#ead6c4',orange:'#b8683e',line:'#d8c5b4',danger:'#a23f36',success:'#47654c',placeholder:'#76655c',onPrimary:'#fffaf4',heroBg:'#704838',heroText:'#fffaf4',heroActionBg:'#fffaf3',heroActionText:'#4f3026'};
const dark={ink:'#f7eee6',muted:'#c7b3a5',paper:'#1d1714',paper2:'#2a211c',card:'#2d231e',cardStrong:'#352923',green:'#deb39a',mint:'#4b352a',orange:'#dc956d',line:'#5b4539',danger:'#ef8f85',success:'#9fc0a4',placeholder:'#bca79b',onPrimary:'#211713',heroBg:'#704838',heroText:'#fffaf4',heroActionBg:'#fffaf3',heroActionText:'#4f3026'};

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
