import { Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { ArrowRight, BookMarked, BookOpen, Flame, Library, Plus, RotateCcw, Sparkles } from 'lucide-react-native';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { Button, Card, Pill, Progress } from '@/components/ui/Parts';
import { categoryLabel, useI18n } from '@/lib/i18n';
import { useThemeColors } from '@/lib/theme';
import { useScreenPadding } from '@/lib/insets';
import { dataSet } from '@/lib/web';

export default function Home() {
  const s = useVocabularyStore();
  const { pick, locale } = useI18n();
  const screenPadding = useScreenPadding();
  const colors = useThemeColors();

  if (!s.isHydrated) {
    return (
      <View className="flex-1 bg-paper p-4 gap-4">
        <View className="h-24 bg-card border border-line rounded-[22px]" />
        <View className="h-56 bg-card border border-line rounded-[22px]" />
      </View>
    );
  }

  const learned = s.words.filter((w) => w.learned).length;
  const due = s.words.filter(
    (w) => w.language === s.settings.defaultLanguage && (!w.nextReviewAt || new Date(w.nextReviewAt) <= new Date())
  ).length;
  const pct = s.words.length ? Math.round((learned / s.words.length) * 100) : 0;
  const stats = [
    {value:s.words.length,label:pick('Всего','Total'),icon:Library},
    {value:s.words.filter((w) => w.language === 'english').length,label:pick('Английских','English'),code:'EN'},
    {value:s.words.filter((w) => w.language === 'german').length,label:pick('Немецких','German'),code:'DE'},
    {value:due,label:pick('Повторить','Review'),icon:Flame},
  ] as const;

  return (
    <ScrollView className="flex-1 bg-paper" {...dataSet({ screenPad: 'true' })} contentContainerStyle={screenPadding} contentContainerClassName="w-full max-w-[720px] self-center px-5 pt-6 gap-6 pb-28">
      <View className="pr-14 gap-1">
        <Text className="text-plum text-xs font-black tracking-wider mb-1">{pick('ВАШ СЛОВАРЬ', 'YOUR VOCABULARY')}</Text>
        <Text className="text-[32px] leading-[38px] font-black text-ink tracking-tight">
          {pick('Продолжим учиться?', 'Ready to keep learning?')}
        </Text>
      </View>

      <Pressable onPress={() => router.push('/settings')} accessibilityRole="button" className="self-start">
        <Pill>{s.settings.defaultLanguage === 'english' ? pick('Английский', 'English') : pick('Немецкий', 'German')}</Pill>
      </Pressable>

      <View className="rounded-[28px] p-6 gap-5 overflow-hidden shadow-md shadow-[#5d465b30]" style={{backgroundColor:colors.heroBg}}>
        <View className="absolute -right-12 -top-16 w-44 h-44 rounded-full bg-orange opacity-20" />
        <View className="absolute -left-14 -bottom-20 w-48 h-48 rounded-full bg-lilac opacity-10" />
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2"><Sparkles size={15} color={colors.heroText}/><Text className="text-xs font-bold tracking-wider" style={{color:colors.heroText,opacity:0.78}}>{pick('ОБЩИЙ ПРОГРЕСС', 'OVERALL PROGRESS')}</Text></View>
          <Text className="text-4xl font-black" style={{color:colors.heroText}}>{pct}%</Text>
        </View>
        <View>
          <Text className="text-base font-bold" style={{color:colors.heroText}}>
            {learned} {pick('из', 'of')} {s.words.length} {pick('слов изучено', 'words learned')}
          </Text>
          <Text className="text-sm mt-1" style={{color:colors.heroText,opacity:0.72}}>{pick('Продолжайте в своём темпе', 'Keep going at your own pace')}</Text>
        </View>
        <Progress value={pct} onDark />
        <View className="flex-row gap-3 mt-1">
          <Button
            className="flex-[1.25]"
            textClassName="text-hero-action-text"
            icon={<BookOpen size={19} color={colors.heroActionText} />}
            label={pick('Начать тренировку', 'Start studying')}
            onPress={() => router.push('/study/flashcards')}
          />
          <Button
            variant="border"
            className="flex-[0.75] border-white/55 bg-white/10"
            textClassName="text-white"
            icon={<Plus size={19} color={colors.heroText} />}
            label={pick('Слово', 'Word')}
            onPress={() => router.push('/add')}
          />
        </View>
      </View>

      <Card className="p-2 flex-row">
        {stats.map((stat,index)=>{
          const Icon='icon' in stat?stat.icon:null;
          return <View key={stat.label} className={`flex-1 items-center py-3 px-1 ${index?'border-l border-line':''}`}>
            <View className="h-6 justify-center">{Icon?<Icon size={17} color={colors.plum}/>:<Text className="text-plum text-xs font-black">{'code' in stat?stat.code:''}</Text>}</View>
            <Text className="text-xl font-black text-ink">{stat.value}</Text>
            <Text className="text-muted text-[11px] text-center" numberOfLines={1}>{stat.label}</Text>
          </View>;
        })}
      </Card>

      <View className="gap-6">
        {s.sessions.length>0&&<View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-ink">{pick('Сегодня на повторение', 'Review today')}</Text>
            <Link href="/study" asChild>
              <Pressable>
                <Text className="text-plum font-bold">{pick('Все режимы', 'All modes')}</Text>
              </Pressable>
            </Link>
          </View>
          <Pressable onPress={() => router.push('/study/flashcards')}>
            <Card className="p-6 flex-row gap-5 items-center">
              <View className="bg-lilac rounded-2xl p-4">
                <RotateCcw color={colors.plum} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-ink">
                  {due} {pick('слов ждут вас', 'words waiting')}
                </Text>
                <Text className="text-muted text-sm">
                  {pick('Короткая тренировка займёт 5 минут', 'A quick session takes about 5 minutes')}
                </Text>
              </View>
              <ArrowRight color={colors.ink} />
            </Card>
          </Pressable>
        </View>}

        <View>
          <Text className="text-xl font-bold text-ink mb-4">{pick('Недавние сеансы', 'Recent sessions')}</Text>
          <View className="gap-3">
            {s.sessions.slice(0, 2).map((x) => (
              <Link href="/sessions" key={x.id} asChild>
                <Pressable>
                  <Card className="p-4 flex-row items-center gap-4">
                    <Pill>{x.language === 'english' ? 'EN' : 'DE'}</Pill>
                    <View className="flex-1">
                      <Text className="font-bold text-ink">{x.name}</Text>
                      <Text className="text-muted text-sm">
                        {x.wordIds.length} {pick('слов', 'words')}
                      </Text>
                    </View>
                    <Flame size={18} color={colors.ink} />
                  </Card>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      </View>

      <View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-ink">{pick('Популярные категории', 'Popular categories')}</Text>
          <Link href="/categories" asChild>
            <Pressable>
              <Text className="text-plum font-bold">{pick('Все', 'All')}</Text>
            </Pressable>
          </Link>
        </View>
        <View className="flex-row flex-wrap gap-3">
          {s.categories.slice(0, 4).map((c) => {
            const ws = s.words.filter((w) => w.categoryId === c.id);
            const p = ws.length ? Math.round((ws.filter((w) => w.learned).length / ws.length) * 100) : 0;
            return (
              <Link href={`/categories/${c.id}`} key={c.id} asChild>
                <Pressable style={{ flexBasis: '47%', flexGrow: 1 }}>
                  <Card className="p-4">
                    <View className="w-10 h-10 rounded-xl bg-lilac items-center justify-center"><BookMarked size={20} color={colors.plum}/></View>
                    <Text className="font-bold text-ink mt-3">{categoryLabel(c.id, c.name, locale)}</Text>
                    <Text className="text-muted text-xs mb-3">
                      {ws.length} {pick('слов', 'words')} · {p}%
                    </Text>
                    <Progress value={p} />
                  </Card>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
