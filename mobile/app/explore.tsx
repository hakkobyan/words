import {useEffect,useRef,useState} from 'react';
import {ActivityIndicator,KeyboardAvoidingView,Platform,Pressable,ScrollView,Text,TextInput,View} from 'react-native';
import Animated,{FadeIn,FadeInDown,ZoomIn} from 'react-native-reanimated';
import {router} from 'expo-router';
import {ArrowLeft,ArrowRight,BookOpen,Check,ChevronRight,Flame,Lightbulb,Plus,Search,Sparkles,Target,Trophy,Volume2,X} from 'lucide-react-native';
import {Button,Card,Progress} from '@/components/ui/Parts';
import {useSemanticGame} from '@/hooks/useSemanticGame';
import {Proximity,SemanticGuess} from '@/lib/semanticRanking';
import {useThemeColors} from '@/lib/theme';
import {useI18n} from '@/lib/i18n';
import {useVocabularyStore} from '@/store/useVocabularyStore';
import {WordHuntTarget} from '@/data/wordHunt';
import {WordHuntLevel} from '@/types';

const proximityCopy:Record<Proximity,[string,string]>={
  correct:['Найдено','Found'],
  'very-close':['Очень близко','Very close'],
  close:['Горячо','Hot'],
  warm:['Теплее','Getting warmer'],
  far:['Далеко','Far'],
};

export default function Explore(){
  const game=useSemanticGame();
  const colors=useThemeColors();
  const {pick}=useI18n();
  const completed=game.completedToday.length;
  const total=game.targets.length;
  const scrollRef=useRef<ScrollView>(null);
  useEffect(()=>{scrollRef.current?.scrollTo({y:0,animated:true})},[game.status]);

  return <KeyboardAvoidingView className="flex-1 bg-paper" behavior={Platform.OS==='ios'?'padding':undefined}>
    <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-line bg-card">
      <Pressable accessibilityRole="button" accessibilityLabel={pick('Назад','Back')} onPress={()=>router.back()} className="w-11 h-11 rounded-full border border-line items-center justify-center active:opacity-70"><ArrowLeft size={20} color={colors.ink}/></Pressable>
      <View className="items-center"><Text className="text-ink font-black">Semantic Word Hunt</Text><Text className="text-muted text-xs">{pick('Экспедиция дня','Today’s expedition')} · {completed}/{total}</Text></View>
      <View className="w-11 h-11 rounded-full bg-mint items-center justify-center"><Flame size={19} color={colors.green}/></View>
    </View>
    <Progress value={(completed/total)*100}/>
    {game.allComplete?<View className="flex-1"><View className="w-full max-w-[720px] self-center px-5 pt-5"><LevelSelector value={game.level} onChange={game.setLevel} pick={pick}/></View><DailyComplete count={total} xp={useVocabularyStore.getState().wordHuntProgress.xp} streak={useVocabularyStore.getState().wordHuntProgress.streak}/></View>:<ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerClassName="w-full max-w-[720px] self-center px-5 py-6 pb-24">
      {game.status==='playing'&&<LevelSelector value={game.level} onChange={game.setLevel} pick={pick}/>}
      {game.status==='playing'&&<Game target={game.target} {...game}/>}
      {game.status==='reveal'&&<Reveal target={game.target} onContinue={()=>game.setStatus('practice')}/>}
      {game.status==='practice'&&<Practice target={game.target} answer={game.practiceAnswer} onAnswer={game.answerPractice} onContinue={game.finishPractice}/>}
      {game.status==='complete'&&<Complete target={game.target} guesses={game.guesses.length} hints={game.hintsUsed} reward={game.reward} onNext={game.nextWord}/>}
    </ScrollView>}
  </KeyboardAvoidingView>;
}

function LevelSelector({value,onChange,pick}:{value:WordHuntLevel;onChange:(level:WordHuntLevel)=>void;pick:(ru:string,en:string)=>string}){
  const options:[WordHuntLevel,string][]=[['mixed',pick('Все','All')],['A1','A1'],['A2','A2'],['B1','B1'],['B2','B2'],['C1','C1'],['C2','C2']];
  return <View className="mb-5"><Text className="text-muted text-xs font-black tracking-wider mb-2">{pick('СЛОЖНОСТЬ СЛОВ','WORD LEVEL')}</Text><View className="flex-row bg-paper-2 border border-line rounded-2xl p-1 gap-1">{options.map(([level,label])=>{const active=value===level;return <Pressable key={level} accessibilityRole="button" accessibilityState={{selected:active}} onPress={()=>onChange(level)} className={`flex-1 min-h-11 rounded-xl items-center justify-center ${active?'bg-card-strong border border-line':'border border-transparent'}`}><Text className={`font-black text-sm ${active?'text-green':'text-muted'}`}>{label}</Text></Pressable>})}</View></View>;
}

function Game({target,guess,setGuess,guesses,hintsUsed,useHint,error,loading,submit,feedback,bestRank,proximityForRank}:{target:WordHuntTarget;guess:string;setGuess:(v:string)=>void;guesses:SemanticGuess[];hintsUsed:number;useHint:()=>void;error:string;loading:boolean;submit:()=>void;feedback:string;bestRank:number;proximityForRank:(rank:number)=>Proximity}){
  const {pick}=useI18n();const colors=useThemeColors();
  const sortedGuesses=[...guesses].sort((a,b)=>a.rank-b.rank||a.createdAt.localeCompare(b.createdAt));
  const errors:Record<string,string>={EMPTY:pick('Введите слово.','Type a word.'),DUPLICATE:pick('Вы уже пробовали это слово.','You already tried this word.'),INVALID:pick('Попробуйте английское слово.','Try an English word.'),NETWORK:pick('Не удалось проверить слово. Попробуйте ещё раз.','Something went wrong. Try again.')};
  const feedbackText=feedback==='very-close'?pick('Вы совсем рядом.','You’re in the right neighborhood.'):feedback==='close'?pick('Очень близко.','You’re getting very close.'):feedback==='warm'?pick('Становится теплее.','You’re getting closer.'):feedback==='far'?pick('Попробуйте подумать о другом значении.','Try thinking of another meaning.'):pick('Каждая попытка покажет, насколько вы близко.','Every guess shows how close you are.');
  return <View className="gap-5">
    <View className="items-center pt-3 gap-2"><View className="w-14 h-14 rounded-[20px] bg-mint items-center justify-center"><Target size={28} color={colors.green}/></View><Text className="text-green text-xs font-black tracking-[2px] mt-2">{pick('НАЙДИТЕ СЛОВО','FIND THE WORD')}</Text><Text className="text-[30px] leading-[36px] font-black text-ink text-center">{pick('Я загадал английское существительное','I’m thinking of an English noun')}</Text><Text className="text-muted text-center leading-6 max-w-[420px]">{pick('Каждый запуск — новое существительное выбранного уровня.','Every launch brings a new noun at your selected level.')}</Text></View>
    <Card className="p-2 flex-row">
      <View className="flex-1 items-center py-2"><Text className="text-muted text-[10px] font-black tracking-wider">{pick('УРОВЕНЬ','LEVEL')}</Text><Text className="text-ink text-lg font-black">{target.level}</Text></View>
      <View className="w-px bg-line"/>
      <View className="flex-1 items-center py-2"><Text className="text-muted text-[10px] font-black tracking-wider">{pick('ПОПЫТКИ','GUESSES')}</Text><Text className="text-ink text-lg font-black">{guesses.length}</Text></View>
      <View className="w-px bg-line"/>
      <View className="flex-1 items-center py-2"><Text className="text-muted text-[10px] font-black tracking-wider">{pick('ЛУЧШИЙ','BEST')}</Text><Text className="text-orange text-lg font-black">{bestRank<Infinity?`#${bestRank}`:'—'}</Text></View>
    </Card>
    <Card className={`p-4 gap-3 ${feedback==='very-close'||feedback==='close'?'border-orange':feedback==='warm'?'border-green':''}`}>
      <Text className="text-ink text-sm font-bold">{pick('Ваша догадка','Your guess')}</Text>
      <View className="flex-row gap-2"><TextInput accessibilityLabel={pick('Английское слово','English word')} value={guess} onChangeText={setGuess} onSubmitEditing={submit} editable={!loading} autoCapitalize="none" autoCorrect={false} returnKeyType="send" placeholder={pick('Например, strong','For example, strong')} placeholderTextColor={colors.placeholder} className="flex-1 min-h-13 rounded-2xl bg-card-strong border border-line px-4 text-ink text-base"/><Pressable accessibilityRole="button" accessibilityLabel={pick('Проверить','Guess')} disabled={loading} onPress={submit} className="min-w-13 min-h-13 rounded-2xl bg-primary-bg items-center justify-center active:opacity-80">{loading?<ActivityIndicator color={colors.cardStrong}/>:<Search size={21} color={colors.cardStrong}/>}</Pressable></View>
      {!!error&&<Text accessibilityLiveRegion="polite" className="text-danger text-sm font-semibold">{errors[error]}</Text>}
      <View accessibilityLiveRegion="polite" className="flex-row items-center gap-2 bg-paper-2 rounded-xl px-3 py-2"><Sparkles size={15} color={colors.orange}/><Text className="text-muted text-sm flex-1">{feedbackText}</Text></View>
    </Card>
    {hintsUsed>0&&<Animated.View entering={FadeIn.duration(200)}><Card className="p-4 gap-2"><Text className="font-black text-ink">{pick('Подсказки','Hints')}</Text>{target.hints.slice(0,hintsUsed).map((hint,index)=><View key={hint} className="flex-row gap-2"><Text className="text-orange font-black">{index+1}.</Text><Text className="text-muted flex-1">{hint}</Text></View>)}</Card></Animated.View>}
    <Pressable accessibilityRole="button" disabled={hintsUsed>=3} onPress={useHint} className="self-center min-h-11 flex-row items-center gap-2 px-4 active:opacity-70"><Lightbulb size={18} color={colors.orange}/><Text className="text-green font-bold">{hintsUsed>=3?pick('Все подсказки открыты','All hints revealed'):pick(`Подсказка · награда −${hintsUsed===0?10:5} XP`,`Hint · reward −${hintsUsed===0?10:5} XP`)}</Text></Pressable>
    {guesses.length>0&&<View className="gap-3"><View className="flex-row justify-between items-center"><View><Text className="text-xl font-black text-ink">{pick('Ваши догадки','Your guesses')}</Text><Text className="text-muted text-xs mt-0.5">{pick('Самые близкие — сверху','Closest guesses first')}</Text></View><Text className="text-muted text-sm">{guesses.length}</Text></View>{sortedGuesses.map((item,index)=><GuessRow key={item.word} guess={item} index={index} proximity={proximityForRank(item.rank)}/>)}</View>}
  </View>;
}

function GuessRow({guess,index,proximity}:{guess:SemanticGuess;index:number;proximity:Proximity}){
  const colors=useThemeColors();const {pick}=useI18n();
  const accent=proximity==='correct'?colors.success:proximity==='very-close'?colors.orange:proximity==='close'?colors.orange:proximity==='warm'?colors.green:colors.muted;
  return <Animated.View entering={FadeInDown.duration(220)}><Card style={{borderLeftWidth:3,borderLeftColor:accent}} className="px-4 py-3 flex-row items-center gap-3"><Text className="text-muted text-xs font-bold w-5">{index+1}</Text><View className="flex-1"><Text className="text-ink text-base font-bold">{guess.word}</Text><Text className="text-xs font-semibold" style={{color:accent}}>{pick(...proximityCopy[proximity])}</Text></View><View className="items-end"><Text className="text-xl font-black" style={{color:accent}}>#{guess.rank}</Text><View className="h-1.5 w-16 bg-paper-2 rounded-full overflow-hidden"><View className="h-full rounded-full" style={{backgroundColor:accent,width:`${Math.max(8,100-Math.min(guess.rank,1000)/10)}%`}}/></View></View></Card></Animated.View>;
}

function Reveal({target,onContinue}:{target:WordHuntTarget;onContinue:()=>void}){
  const colors=useThemeColors();const {pick}=useI18n();const s=useVocabularyStore();const [saved,setSaved]=useState(false);
  const already=s.words.some(w=>w.language==='english'&&w.word.toLowerCase()===target.word);
  const save=()=>{if(already||saved)return;const session=s.sessions.find(x=>x.language==='english')?.id||s.addSession('Semantic Word Hunt','english');s.addWord({language:'english',word:target.word,translationRu:target.translationRu,categoryId:target.categoryId,sessionId:session,example:target.example,pronunciation:target.pronunciation,partOfSpeech:target.partOfSpeech,explanation:target.definition,synonyms:target.related,source:'word-hunt',favorite:false,learned:false,correctAnswers:0,wrongAnswers:0,difficulty:'new'});setSaved(true)};
  return <Animated.View entering={ZoomIn.duration(300)} className="gap-5"><View className="items-center gap-2 pt-3"><View className="w-16 h-16 rounded-full bg-success items-center justify-center"><Trophy size={30} color={colors.cardStrong}/></View><Text className="text-success text-xs font-black tracking-[2px]">{pick('ВЫ НАШЛИ ЕГО','YOU FOUND IT')}</Text><Text className="text-[38px] font-black text-ink uppercase text-center">{target.word}</Text><View className="flex-row gap-2"><View className="bg-paper-2 rounded-full px-3 py-1.5"><Text className="text-muted text-xs font-bold">{target.partOfSpeech}</Text></View><View className="bg-mint rounded-full px-3 py-1.5"><Text className="text-green text-xs font-black">{target.level}</Text></View></View></View><Card className="p-5 gap-4"><Text className="text-ink text-lg leading-7 font-semibold">{target.definition}</Text><View className="flex-row items-center gap-2"><Volume2 size={19} color={colors.green}/><Text className="text-green font-bold">{target.pronunciation}</Text></View><View className="bg-paper-2 rounded-2xl p-4"><Text className="text-muted text-sm leading-6">“{target.example}”</Text></View><View><Text className="text-ink font-bold mb-2">{pick('Связанные слова','Related words')}</Text><View className="flex-row flex-wrap gap-2">{target.related.map(word=><View key={word} className="bg-mint rounded-full px-3 py-2"><Text className="text-green text-xs font-bold">{word}</Text></View>)}</View></View></Card><Button variant="secondary" fullWidth disabled={already||saved} icon={<Plus size={18} color={colors.green}/>} label={already||saved?pick('Уже в моих словах','Already in My Words'):pick('Добавить в мои слова','Add to My Words')} onPress={save}/><Button variant="primary" fullWidth icon={<ArrowRight size={18} color={colors.cardStrong}/>} label={pick('Короткая практика','Quick practice')} onPress={onContinue}/></Animated.View>;
}

function Practice({target,answer,onAnswer,onContinue}:{target:WordHuntTarget;answer:number|null;onAnswer:(index:number)=>void;onContinue:()=>void}){
  const colors=useThemeColors();const {pick}=useI18n();const answered=answer!==null;const correct=answer===target.practice.correctIndex;
  return <View className="gap-5"><View className="items-center gap-2 pt-4"><View className="w-14 h-14 rounded-[20px] bg-mint items-center justify-center"><BookOpen size={27} color={colors.green}/></View><Text className="text-3xl font-black text-ink text-center">{pick('Закрепим слово','Make it stick')}</Text><Text className="text-muted text-center">{target.practice.question}</Text></View><View className="gap-3">{target.practice.options.map((option,index)=>{const isCorrect=index===target.practice.correctIndex,isChosen=index===answer;return <Pressable key={option} disabled={answered} accessibilityRole="button" accessibilityState={{selected:isChosen,disabled:answered}} onPress={()=>onAnswer(index)} className={`min-h-16 rounded-2xl border p-4 flex-row items-center gap-3 active:opacity-80 ${answered&&isCorrect?'bg-correct-bg border-success':isChosen?'bg-wrong-bg border-danger':'bg-card border-line'}`}><View className="w-8 h-8 rounded-full border border-line items-center justify-center">{answered&&isCorrect?<Check size={17} color={colors.success}/>:answered&&isChosen?<X size={17} color={colors.danger}/>:<Text className="text-muted font-black">{String.fromCharCode(65+index)}</Text>}</View><Text className="text-ink flex-1 leading-6">{option}</Text></Pressable>})}</View>{answered&&<Animated.View entering={FadeInDown.duration(220)}><Card className="p-4 gap-2"><Text className={`font-black ${correct?'text-success':'text-danger'}`}>{correct?pick('Верно!','Correct!'):pick('Почти. Посмотрите на правильный вариант.','Not quite. Review the correct answer.')}</Text><Text className="text-muted leading-6">{target.practice.explanation}</Text></Card></Animated.View>}{answered&&<Button variant="primary" fullWidth label={pick('Продолжить','Continue')} onPress={onContinue}/>}</View>;
}

function Complete({target,guesses,hints,reward,onNext}:{target:WordHuntTarget;guesses:number;hints:number;reward:number;onNext:()=>void}){const colors=useThemeColors();const {pick}=useI18n();return <Animated.View entering={ZoomIn.duration(260)} className="flex-1 justify-center gap-5 pt-12"><View className="items-center gap-3"><View className="w-20 h-20 rounded-full bg-mint items-center justify-center"><Check size={38} color={colors.success}/></View><Text className="text-success text-xs font-black tracking-[2px]">{pick('СЛОВО ОСВОЕНО','WORD MASTERED')}</Text><Text className="text-4xl font-black text-ink uppercase">{target.word}</Text></View><Card className="p-5 flex-row justify-around"><Metric value={String(guesses)} label={pick('попыток','guesses')}/><Metric value={String(hints)} label={pick('подсказок','hints')}/><Metric value={`+${reward}`} label="XP"/></Card><Button variant="primary" fullWidth icon={<ChevronRight size={19} color={colors.cardStrong}/>} label={pick('Следующее слово','Next word')} onPress={onNext}/></Animated.View>}
function Metric({value,label}:{value:string;label:string}){return <View className="items-center"><Text className="text-2xl font-black text-ink">{value}</Text><Text className="text-muted text-xs">{label}</Text></View>}
function DailyComplete({count,xp,streak}:{count:number;xp:number;streak:number}){const colors=useThemeColors();const {pick}=useI18n();return <View className="flex-1 items-center justify-center p-6"><Animated.View entering={ZoomIn.duration(300)} className="w-full max-w-[520px] gap-5"><View className="items-center gap-3"><View className="w-20 h-20 rounded-full bg-success items-center justify-center"><Trophy size={38} color={colors.cardStrong}/></View><Text className="text-3xl font-black text-ink text-center">{pick('Экспедиция завершена','Today’s expedition complete')}</Text><Text className="text-muted text-center">{pick(`Все ${count} слов найдены и закреплены.`,`All ${count} words discovered and practiced.`)}</Text></View><Card className="p-5 flex-row justify-around"><Metric value={`${count} / ${count}`} label={pick('слов','words')}/><Metric value={`+${xp}`} label="XP"/><Metric value={String(streak)} label={pick('дней подряд','day streak')}/></Card><Button variant="primary" fullWidth label={pick('Вернуться к тренировкам','Back to study')} onPress={()=>router.replace('/study')}/></Animated.View></View>}
