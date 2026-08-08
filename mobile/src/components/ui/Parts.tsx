import {useState} from 'react';
import {Check,ChevronDown,Languages,Leaf,Search} from 'lucide-react-native';
import {Modal,Pressable,ScrollView,Text,TextInput,View,ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StudyLanguage} from '@/types';
import {useI18n} from '@/lib/i18n';
import {useThemeColors} from '@/lib/theme';

export function Card({children,className='',style}:{children:React.ReactNode;className?:string;style?:ViewStyle}){
  return <View style={style} className={`bg-card border border-line rounded-[20px] ${className}`}>{children}</View>;
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
      className={`min-h-12 rounded-[14px] px-[18px] flex-row items-center justify-center gap-2 active:opacity-80 ${s.box} ${fullWidth?'w-full':''} ${disabled?'opacity-50':''} ${className}`}>
      {icon}
      <Text className={`font-bold ${textClassName??s.text}`}>{label}</Text>
    </Pressable>
  );
}

export function Pill({children}:{children:React.ReactNode}){
  return <View className="rounded-full px-3 py-1.5 bg-mint border border-line self-start"><Text className="text-[12px] font-extrabold text-green tracking-wide">{children}</Text></View>;
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
            className={`min-h-12 px-4 rounded-xl flex-row items-center justify-center gap-2 flex-1 active:opacity-80 ${active?'bg-card-strong border border-line':'bg-paper-2 border border-paper-2'}`}>
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

/**
 * A sheet of options rather than a platform picker. The native picker renders
 * as an unstyleable <select> on web — an iOS wheel pinned to the bottom of the
 * browser, ignoring the app's colours entirely — and takes two taps to change
 * a value. This looks the same everywhere and commits on the first tap.
 */
export function Select<T extends string>({value,onChange,options,label}:{value:T;onChange:(v:T)=>void;options:{label:string;value:T}[];label?:string}){
  const colors=useThemeColors();
  const {t}=useI18n();
  const insets=useSafeAreaInsets();
  const [open,setOpen]=useState(false);
  const current=options.find(o=>o.value===value);
  const choose=(next:T)=>{onChange(next);setOpen(false)};
  return (
    <>
      <Pressable onPress={()=>setOpen(true)} accessibilityRole="button" accessibilityLabel={label} accessibilityValue={{text:current?.label}}
        className="min-h-12 bg-card-strong border border-line rounded-2xl px-4 flex-row items-center justify-between active:opacity-70">
        <Text className="text-ink font-medium flex-1" numberOfLines={1}>{current?.label??''}</Text>
        <ChevronDown size={18} color={colors.green}/>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={()=>setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('done')}
          onPress={()=>setOpen(false)}
          style={{flex:1,backgroundColor:'rgba(20,12,8,0.45)',justifyContent:'flex-end'}}
        >
          {/* Swallows taps so choosing an option does not dismiss via the backdrop. */}
          <Pressable onPress={()=>{}} className="bg-card rounded-t-[26px] border-t border-line overflow-hidden" style={{paddingBottom:insets.bottom+8,maxHeight:'75%'}}>
            <View className="items-center pt-3 pb-1"><View className="h-1 w-10 rounded-full bg-line"/></View>
            {!!label&&<Text className="text-muted text-xs font-bold uppercase tracking-wider px-5 pt-2 pb-1">{label}</Text>}
            <ScrollView bounces={false}>
              {options.map((option,index)=>{
                const selected=option.value===value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{selected}}
                    onPress={()=>choose(option.value)}
                    className={`min-h-14 px-5 flex-row items-center justify-between active:bg-paper-2 ${index?'border-t border-line':''}`}
                  >
                    <Text className={`text-base flex-1 ${selected?'text-green font-bold':'text-ink'}`}>{option.label}</Text>
                    {selected&&<Check size={19} color={colors.green}/>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
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
