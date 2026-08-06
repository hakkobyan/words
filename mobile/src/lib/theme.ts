import {useColorScheme} from 'nativewind';

const light={ink:'#291f1a',muted:'#6f5f56',paper:'#efe5d8',paper2:'#e4d5c5',card:'#fffaf3',cardStrong:'#ffffff',green:'#704838',mint:'#ead6c4',orange:'#b8683e',line:'#d8c5b4',danger:'#a23f36',success:'#47654c',placeholder:'#76655c'};
const dark={ink:'#f7eee6',muted:'#c7b3a5',paper:'#1d1714',paper2:'#2a211c',card:'#2d231e',cardStrong:'#352923',green:'#deb39a',mint:'#4b352a',orange:'#dc956d',line:'#5b4539',danger:'#ef8f85',success:'#9fc0a4',placeholder:'#bca79b'};

export function useThemeColors(){
  const {colorScheme}=useColorScheme();
  return colorScheme==='dark'?dark:light;
}
