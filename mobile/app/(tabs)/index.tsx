import { Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { ArrowRight, BookOpen, Flame, Plus, RotateCcw } from 'lucide-react-native';
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
    [s.words.length, pick('Всего слов', 'Total words'), '📚'],
    [s.words.filter((w) => w.language === 'english').length, pick('Английских', 'English'), 'EN'],
    [s.words.filter((w) => w.language === 'german').length, pick('Немецких', 'German'), 'DE'],
    [due, pick('На повторение', 'To review'), '🔥'],
  ] as const;

  return (
    <ScrollView className="flex-1 bg-paper" {...dataSet({ screenPad: 'true' })} contentContainerStyle={screenPadding} contentContainerClassName="w-full max-w-[720px] self-center p-4 gap-5 pb-28">
      <View className="pr-14">
        <Text className="text-muted text-sm mb-1">{pick('Ваш словарь', 'Your vocabulary')}</Text>
        <Text className="text-3xl font-black text-ink tracking-tight">
          {pick('Продолжим учиться?', 'Ready to keep learning?')}
        </Text>
      </View>

      <Pressable onPress={() => router.push('/settings')} accessibilityRole="button" className="self-start">
        <Pill>{s.settings.defaultLanguage === 'english' ? pick('Английский', 'English') : pick('Немецкий', 'German')}</Pill>
      </Pressable>

      <View className="rounded-[22px] p-5 gap-3" style={{backgroundColor:colors.heroBg}}>
        <Text className="text-sm" style={{color:colors.heroText}}>{pick('ОБЩИЙ ПРОГРЕСС', 'OVERALL PROGRESS')}</Text>
        <View className="flex-row items-end gap-3">
          <Text className="text-5xl font-black" style={{color:colors.heroText}}>{pct}%</Text>
          <Text className="pb-2" style={{color:colors.heroText}}>
            {learned} {pick('из', 'of')} {s.words.length} {pick('слов изучено', 'words learned')}
          </Text>
        </View>
        <Progress value={pct} />
        <View className="flex-row gap-3 mt-3">
          <Button
            className="bg-hero-action-bg border-hero-action-bg"
            textClassName="text-hero-action-text"
            icon={<BookOpen size={19} color={colors.heroActionText} />}
            label={pick('Начать тренировку', 'Start studying')}
            onPress={() => router.push('/study/flashcards')}
          />
          <Button
            variant="secondary"
            icon={<Plus size={19} color={colors.green} />}
            label={pick('Слово', 'Word')}
            onPress={() => router.push('/add')}
          />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {stats.map(([n,l,e])=><Card key={l} className="p-4" style={{flexBasis:'47%',flexGrow:1}}><Text className="text-xl text-ink">{e}</Text><Text className="text-2xl font-black text-ink mt-2">{n}</Text><Text className="text-muted text-sm">{l}</Text></Card>)}
      </View>

      <View className="gap-6">
        {s.sessions.length>0&&<View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-ink">{pick('Сегодня на повторение', 'Review today')}</Text>
            <Link href="/study" asChild>
              <Pressable>
                <Text className="text-green font-bold">{pick('Все режимы', 'All modes')}</Text>
              </Pressable>
            </Link>
          </View>
          <Pressable onPress={() => router.push('/study/flashcards')}>
            <Card className="p-4 flex-row gap-4 items-center">
              <View className="bg-mint rounded-2xl p-3">
                <RotateCcw color={colors.green} />
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
              <Text className="text-green font-bold">{pick('Все', 'All')}</Text>
            </Pressable>
          </Link>
        </View>
        <View className="flex-row flex-wrap gap-3">
          {s.categories.slice(0, 4).map((c) => {
            const ws = s.words.filter((w) => w.categoryId === c.id);
            const p = ws.length ? Math.round((ws.filter((w) => w.learned).length / ws.length) * 100) : 0;
            return (
              <Link href={`/categories/${c.id}`} key={c.id} asChild>
                <Pressable style={{flexBasis:'47%',flexGrow:1}}>
                  <Card className="p-4">
                    <Text className="text-2xl">{c.icon}</Text>
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
