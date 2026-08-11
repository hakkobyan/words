import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { Card, Progress, Button, Pill } from '@/components/ui/Parts';
import { shuffle } from '@/lib/shuffle';
import { UserWord } from '@/types';
import { useI18n } from '@/lib/i18n';
import { useScreenPadding } from '@/lib/insets';
import { dataSet } from '@/lib/web';

export default function Flashcards() {
  const s = useVocabularyStore();
  const { pick } = useI18n();
  const screenPadding = useScreenPadding();
  const { category, session } = useLocalSearchParams<{ category?: string; session?: string }>();
  const [cards, setCards] = useState<UserWord[]>([]);
  const [ready, setReady] = useState(false);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(0);
  const [hard, setHard] = useState(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!s.isHydrated) return;
    let pool = useVocabularyStore.getState().words.filter((w) => w.language === s.settings.defaultLanguage);
    if (category) pool = pool.filter((w) => w.categoryId === category);
    if (session) pool = pool.filter((w) => w.sessionId === session);
    setCards((s.settings.shuffle ? shuffle(pool) : pool).slice(0, s.settings.cardsPerSession));
    setI(0);
    setFlip(false);
    setKnown(0);
    setHard(0);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.isHydrated, s.settings.defaultLanguage, s.settings.cardsPerSession, s.settings.shuffle, category, session]);

  useEffect(() => {
    rotation.value = withTiming(flip ? 180 : 0, { duration: 350 });
  }, [flip, rotation]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
    backfaceVisibility: 'hidden',
    opacity: rotation.value > 90 ? 0 : 1,
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value + 180}deg` }],
    backfaceVisibility: 'hidden',
    opacity: rotation.value > 90 ? 1 : 0,
  }));

  if (!ready) return <View className="flex-1 bg-paper" />;

  if (!cards.length) {
    return (
      <View className="flex-1 bg-paper items-center justify-center p-6">
        <Card className="p-10 items-center">
          <Text className="text-2xl font-bold text-ink">{pick('Пока нечего учить', 'Nothing to study yet')}</Text>
          <Text className="text-muted mt-2 mb-5 text-center">{pick('Сначала добавьте несколько слов выбранного языка', 'Add a few words in the selected language first')}</Text>
          <Button variant="primary" label={pick('Добавить слова', 'Add words')} onPress={() => router.push('/add')} />
        </Card>
      </View>
    );
  }

  if (i >= cards.length) {
    return (
      <View className="flex-1 bg-paper items-center justify-center p-6">
        <Card className="p-8 items-center">
          <Text className="text-5xl mb-4">🎉</Text>
          <Text className="text-3xl font-black text-ink">{pick('Тренировка завершена', 'Session complete')}</Text>
          <Text className="text-muted mt-2">{pick(`Вы повторили ${cards.length} слов`, `You reviewed ${cards.length} words`)}</Text>
          <View className="flex-row gap-6 my-7">
            <View className="items-center">
              <Text className="text-2xl font-bold text-ink">{known}</Text>
              <Text className="text-muted text-xs">{pick('Знаю', 'Know')}</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-ink">{hard}</Text>
              <Text className="text-muted text-xs">{pick('Сложно', 'Hard')}</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-ink">{cards.length - known - hard}</Text>
              <Text className="text-muted text-xs">{pick('Не знаю', "Don't know")}</Text>
            </View>
          </View>
          <Button variant="primary" label={pick('На главную', 'Home')} onPress={() => router.push('/')} />
        </Card>
      </View>
    );
  }

  const w = cards[i];
  const answer = (v: 'bad' | 'hard' | 'good') => {
    const now = new Date();
    const days = v === 'bad' ? 0 : v === 'hard' ? 1 : 7;
    const next = new Date(now.getTime() + days * 86400000).toISOString();
    s.updateWord(w.id, {
      wrongAnswers: w.wrongAnswers + (v === 'bad' ? 1 : 0),
      correctAnswers: w.correctAnswers + (v === 'good' ? 1 : 0),
      difficulty: v === 'bad' ? 'difficult' : v === 'hard' ? 'learning' : w.correctAnswers >= 2 ? 'learned' : 'learning',
      learned: v === 'good' && w.correctAnswers >= 2,
      lastReviewedAt: now.toISOString(),
      nextReviewAt: next,
    });
    if (v === 'good') setKnown((x) => x + 1);
    if (v === 'hard') setHard((x) => x + 1);
    setI((x) => x + 1);
    setFlip(false);
  };

  return (
    <View
      {...dataSet({ screenPad: 'true' })}
      className="flex-1 w-full max-w-[720px] self-center bg-paper p-5"
      style={screenPadding}
    >
      <View className="flex-row justify-between mb-3">
        <Text className="font-bold text-ink">
          {i + 1} {pick('из', 'of')} {cards.length}
        </Text>
        <Text className="text-muted">{Math.round((i / cards.length) * 100)}%</Text>
      </View>
      <Progress value={(i / cards.length) * 100} />
      <Pressable onPress={() => setFlip(!flip)} className="flex-1 mt-6" style={{ minHeight: 380 }}>
        <Animated.View style={[frontStyle, { position: 'absolute', width: '100%', minHeight: 380 }]}>
          <Card className="p-8 items-center justify-center flex-1">
            <Pill>{w.language === 'english' ? 'EN' : 'DE'}</Pill>
            <Text className="text-4xl font-black text-ink my-5">{w.word}</Text>
            <Text className="text-muted mt-8">{pick('Нажмите, чтобы увидеть перевод', 'Tap to see the translation')}</Text>
          </Card>
        </Animated.View>
        <Animated.View style={[backStyle, { position: 'absolute', width: '100%', minHeight: 380 }]}>
          <Card className="p-8 items-center justify-center flex-1">
            <Text className="text-muted text-sm">{pick('ПЕРЕВОД', 'TRANSLATION')}</Text>
            <Text className="text-4xl font-black text-ink my-5">{w.translationRu}</Text>
            {s.settings.showExamples && !!w.example && <Text className="text-ink text-center">{w.example}</Text>}
            {!!w.note && <Text className="text-muted mt-3 text-center">{w.note}</Text>}
          </Card>
        </Animated.View>
      </Pressable>
      {flip && (
        <View className="flex-row gap-2 mt-4">
          <Button variant="danger" label={pick('Не знаю', "Don't know")} onPress={() => answer('bad')} className="flex-1" />
          <Button variant="warning" label={pick('Сложно', 'Hard')} onPress={() => answer('hard')} className="flex-1" />
          <Button variant="primary" label={pick('Знаю', 'Know')} onPress={() => answer('good')} className="flex-1" />
        </View>
      )}
    </View>
  );
}
