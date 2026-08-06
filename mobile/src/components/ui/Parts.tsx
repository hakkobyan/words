import {useState} from 'react';
import {ChevronDown,Languages,Leaf,Search} from 'lucide-react-native';
import {Modal,Pressable,Text,TextInput,View,ViewStyle} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {StudyLanguage} from '@/types';
import {useI18n} from '@/lib/i18n';
import {useThemeColors} from '@/lib/theme';

export function Card({children,className='',style}:{children:React.ReactNode;className?:string;style?:ViewStyle}){
  return <View style={style} className={`bg-card border border-line rounded-[22px] ${className}`}>{children}</View>;
}

type ButtonVariant='default'|'primary'|'secondary'|'danger'|'warning'|'border';
const buttonStyles:Record<ButtonVariant,{box:string;text:string}>={
  default:{box:'bg-card-strong border border-line',text:'text-ink'},
  primary:{box:'bg-primary-bg border border-primary-bg',text:'text-on-primary'},
  secondary:{box:'bg-mint border border-[#d7bda8]',text:'text-on-secondary'},
  danger:{box:'bg-danger border border-danger',text:'text-white'},
  warning:{box:'bg-[#8a5a27] border border-[#8a5a27]',text:'text-white'},
  border:{box:'bg-transparent border border-line',text:'text-ink'},
};
export function Button({variant='default',icon,label,onPress,disabled,fullWidth,className='',textClassName}:{variant?:ButtonVariant;icon?:React.ReactNode;label:string;onPress?:()=>void;disabled?:boolean;fullWidth?:boolean;className?:string;textClassName?:string}){
  const s=buttonStyles[variant];
  return (
    <Pressable disabled={disabled} onPress={onPress} accessibilityRole="button" accessibilityState={{disabled}}
      className={`min-h-12 rounded-2xl px-[18px] flex-row items-center justify-center gap-[9px] ${s.box} ${fullWidth?'w-full':''} ${disabled?'opacity-50':''} ${className}`}>
      {icon}
      <Text className={`font-bold ${textClassName??s.text}`}>{label}</Text>
    </Pressable>
  );
}

export function Pill({children}:{children:React.ReactNode}){
  return <View className="rounded-full px-[9px] py-[5px] bg-mint border border-[#d7bda8] self-start"><Text className="text-[12px] font-extrabold text-green tracking-wide">{children}</Text></View>;
}

export function LanguageSelector({value,onChange}:{value:StudyLanguage;onChange:(v:StudyLanguage)=>void}){
  const {t}=useI18n();
  const colors=useThemeColors();
  return (
    <View className="flex-row p-1 rounded-2xl gap-1 bg-paper-2 border border-line" accessibilityRole="tablist" accessibilityLabel={t('studyLanguage')}>
      {(['english','german'] as const).map(language=>{
        const active=value===language;
        return (
          <Pressable key={language} accessibilityRole="tab" accessibilityState={{selected:active}} onPress={()=>onChange(language)}
            className={`min-h-11 px-4 rounded-xl flex-row items-center justify-center gap-2 flex-1 ${active?'bg-card-strong border border-line':'bg-paper-2 border border-paper-2'}`}>
            <Languages size={17} color={active?colors.green:colors.muted}/>
            <Text className={`font-bold text-sm ${active?'text-green':'text-muted'}`}>{t(language)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Progress({value}:{value:number}){
  const clamped=Math.max(0,Math.min(100,value));
  return (
    <View className="h-[9px] bg-paper-2 border border-line rounded-full overflow-hidden" accessibilityRole="progressbar" accessibilityValue={{min:0,max:100,now:Math.round(value)}}>
      <View className="h-full bg-orange rounded-full" style={{width:`${clamped}%`}}/>
    </View>
  );
}

export function SearchBox({value,onChange}:{value:string;onChange:(s:string)=>void}){
  const {t}=useI18n();
  const colors=useThemeColors();
  return (
    <View className="relative">
      <View className="absolute left-4 top-4 z-10"><Search size={18} color={colors.muted}/></View>
      <TextInput value={value} onChangeText={onChange} placeholder={t('searchPlaceholder')} placeholderTextColor={colors.placeholder}
        accessibilityLabel={t('searchWords')}
        className="pl-11 min-h-12 bg-card-strong border border-line rounded-2xl px-4 text-ink"/>
    </View>
  );
}

export function Select<T extends string>({value,onChange,options}:{value:T;onChange:(v:T)=>void;options:{label:string;value:T}[]}){
  const colors=useThemeColors();
  const {t}=useI18n();
  const [open,setOpen]=useState(false);
  const current=options.find(o=>o.value===value);
  return (
    <>
      <Pressable onPress={()=>setOpen(true)} accessibilityRole="button"
        className="min-h-12 bg-card-strong border border-line rounded-2xl px-4 flex-row items-center justify-between">
        <Text className="text-ink">{current?.label??''}</Text>
        <ChevronDown size={17} color={colors.muted}/>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={()=>setOpen(false)}>
        <Pressable style={{flex:1,backgroundColor:'rgba(0,0,0,0.3)'}} onPress={()=>setOpen(false)}/>
        <View className="bg-card-strong">
          <View className="flex-row justify-end p-3 border-b border-line">
            <Pressable onPress={()=>setOpen(false)}><Text className="text-green font-bold">{t('done')}</Text></Pressable>
          </View>
          <Picker selectedValue={value} onValueChange={(v)=>onChange(v as T)} itemStyle={{color:colors.ink}}>
            {options.map(o=><Picker.Item key={o.value} label={o.label} value={o.value} color={colors.ink}/>)}
          </Picker>
        </View>
      </Modal>
    </>
  );
}

export function Empty({title,text}:{title:string;text:string}){
  const colors=useThemeColors();
  return (
    <Card className="p-10 items-center">
      <View className="bg-mint rounded-2xl p-4 mb-4"><Leaf size={28} color={colors.green}/></View>
      <Text className="font-bold text-lg text-ink text-center">{title}</Text>
      <Text className="text-muted mt-2 text-center">{text}</Text>
    </Card>
  );
}
