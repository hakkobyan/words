import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { Card, Progress, Button, Pill } from '@/components/ui/Parts';
import { shuffle } from '@/lib/shuffle';
import { UserWord } from '@/types';
import { useI18n } from '@/lib/i18n';
import { useThemeColors } from '@/lib/theme';

type Question = { word: UserWord; options: UserWord[] };

export default function Quiz() {
  const s = useVocabularyStore();
  const { pick } = useI18n();
  const colors = useThemeColors();
  const [deck, setDeck] = useState<Question[]>([]);
  const [ready, setReady] = useState(false);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState('');

  useEffect(() => {
    if (!s.isHydrated) return;
    const pool = useVocabularyStore.getState().words.filter((w) => w.language === s.settings.defaultLanguage);
    if (pool.length >= 4) {
      const questionWords = (s.settings.shuffle ? shuffle(pool) : pool).slice(0, 10);
      setDeck(
        questionWords.map((word) => ({
          word,
          options: shuffle([word, ...shuffle(pool.filter((w) => w.id !== word.id)).slice(0, 3)]),
        }))
      );
    } else {
      setDeck([]);
    }
    setI(0);
    setScore(0);
    setPicked('');
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.isHydrated, s.settings.defaultLanguage, s.settings.shuffle]);

  if (!ready) return <View className="flex-1 bg-paper" />;

  if (s.words.filter((w) => w.language === s.settings.defaultLanguage).length < 4) {
    return (
      <View className="flex-1 bg-paper items-center justify-center p-6">
        <Card className="p-10 items-center">
          <Text className="text-2xl font-bold text-ink">{pick('Нужно минимум 4 слова', 'You need at least 4 words')}</Text>
          <Text className="text-muted my-4 text-center">
            {pick('Добавьте ещё слов выбранного языка, чтобы варианты ответов были корректными.', 'Add more words in the selected language so answer options make sense.')}
          </Text>
          <Button variant="primary" label={pick('Добавить слова', 'Add words')} onPress={() => router.push('/add')} />
        </Card>
      </View>
    );
  }

  if (i >= deck.length) {
    return (
      <View className="flex-1 bg-paper items-center justify-center p-6">
        <Card className="p-8 items-center">
          <Text className="text-3xl font-black text-ink">
            {pick('Результат', 'Score')}: {score} {pick('из', 'of')} {deck.length}
          </Text>
          <Text className="text-muted my-5">
            {pick('Точность', 'Accuracy')} {Math.round((score / deck.length) * 100)}%
          </Text>
          <Button variant="primary" label={pick('На главную', 'Home')} onPress={() => router.push('/')} />
        </Card>
      </View>
    );
  }

  const { word: q, options } = deck[i];

  return (
    <View className="flex-1 w-full max-w-[720px] self-center bg-paper p-5">
      <Text className="text-muted text-sm mb-2">
        {pick('Вопрос', 'Question')} {i + 1} {pick('из', 'of')} {deck.length}
      </Text>
      <Progress value={(i / deck.length) * 100} />
      <Card className="p-7 mt-6 items-center">
        <Pill>{q.language === 'english' ? 'EN' : 'DE'}</Pill>
        <Text className="text-4xl font-black text-ink my-8">{q.word}</Text>
        <View className="gap-3 w-full">
          {options.map((o) => {
            const isCorrect = o.id === q.id;
            const isPicked = picked === o.id;
            const bg = picked ? (isCorrect ? 'bg-correct-bg border-correct-bg' : isPicked ? 'bg-wrong-bg border-wrong-bg' : 'bg-card-strong border-line') : 'bg-card-strong border-line';
            const textColor = picked ? (isCorrect ? colors.success : isPicked ? colors.danger : colors.ink) : colors.ink;
            return (
              <Pressable
                key={o.id}
                disabled={!!picked}
                onPress={() => {
                  setPicked(o.id);
                  if (o.id === q.id) setScore((x) => x + 1);
                }}
                className={`min-h-12 rounded-2xl px-4 items-center justify-center border ${bg}`}
              >
                <Text style={{ color: textColor, fontWeight: '600' }}>{o.translationRu}</Text>
              </Pressable>
            );
          })}
        </View>
        {!!picked && (
          <Button
            variant="primary"
            label={pick('Продолжить', 'Continue')}
            onPress={() => {
              setI((x) => x + 1);
              setPicked('');
            }}
            fullWidth
            className="mt-5"
          />
        )}
      </Card>
    </View>
  );
}
