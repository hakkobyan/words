import {useMemo, useState} from 'react';
import {ScrollView, Text, TextInput, View} from 'react-native';
import {ArrowRight, Check, Plus, Sparkles, X} from 'lucide-react-native';
import {useVocabularyStore} from '@/store/useVocabularyStore';
import {useI18n} from '@/lib/i18n';
import {useThemeColors} from '@/lib/theme';
import {Button, Card, Pill, Progress} from '@/components/ui/Parts';
import {isCorrectAnswer} from '@/lib/answers';
import {DailyCard, answersFor, pickDailyWords, promptFor} from '@/lib/dailyWords';

export default function DailyWords({onDone}: {onDone: () => void}) {
  const store = useVocabularyStore();
  const {pick} = useI18n();
  const colors = useThemeColors();
  const language = store.settings.defaultLanguage;
  // Drawn once per mount, so the batch stays stable while the user works through it.
  const cards = useMemo(
    () => pickDailyWords(language, store.settings.learnerLevel, store.seenDailyIds, store.words),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState<'none' | 'right' | 'wrong'>('none');
  const [correct, setCorrect] = useState(0);
  const [added, setAdded] = useState<string[]>([]);

  const card: DailyCard | undefined = cards[index];
  // Russian needs two cases here: "с английского" but "на английский".
  const fromName = language === 'english' ? pick('английского', 'English') : pick('немецкого', 'German');
  const toName = language === 'english' ? pick('английский', 'English') : pick('немецкий', 'German');

  const finish = () => {
    store.markDailySeen(cards.map((c) => c.entry.id));
    onDone();
  };

  if (cards.length === 0) {
    return (
      <Shell>
        <Text className="text-2xl font-black text-ink">{pick('Слова закончились', 'No words left')}</Text>
        <Text className="text-muted">{pick('Вы разобрали весь запас для своего уровня.', 'You have worked through the whole pool for your level.')}</Text>
        <Button variant="primary" fullWidth label={pick('Продолжить', 'Continue')} onPress={onDone} />
      </Shell>
    );
  }

  if (!card) {
    return (
      <Shell>
        <View className="bg-mint rounded-2xl p-3 self-center"><Sparkles size={26} color={colors.green} /></View>
        <Text className="text-2xl font-black text-ink text-center">{pick('Разминка окончена', 'Warm-up complete')}</Text>
        <Text className="text-muted text-center">
          {pick(`Угадано ${correct} из ${cards.length}.`, `Guessed ${correct} of ${cards.length}.`)}
          {added.length > 0 && ' ' + pick(`Добавлено в словарь: ${added.length}.`, `Added to your dictionary: ${added.length}.`)}
        </Text>
        <Button variant="primary" fullWidth label={pick('К приложению', 'Go to the app')} onPress={finish} />
      </Shell>
    );
  }

  const check = () => {
    if (verdict !== 'none') return;
    const right = isCorrectAnswer(answer, answersFor(card));
    setVerdict(right ? 'right' : 'wrong');
    if (right) setCorrect((c) => c + 1);
  };

  const next = () => {
    setIndex((i) => i + 1);
    setAnswer('');
    setVerdict('none');
  };

  const addToDictionary = () => {
    const sessionId =
      store.sessions.find((s) => s.language === language)?.id ??
      store.addSession(pick('Новые слова', 'New words'), language);
    store.addWord({
      language,
      word: card.entry.word,
      translationRu: card.entry.translationRu,
      categoryId: card.entry.categoryId,
      sessionId,
      cefrLevel: card.entry.level,
      favorite: false,
      learned: false,
      correctAnswers: 0,
      wrongAnswers: 0,
      difficulty: 'new',
    });
    setAdded((list) => [...list, card.entry.id]);
  };

  const alreadyAdded = added.includes(card.entry.id);
  const expected = card.direction === 'toRu' ? card.entry.translationRu : card.entry.word;
  const fieldTone = verdict === 'right' ? 'bg-correct-bg' : verdict === 'wrong' ? 'bg-wrong-bg' : 'bg-card-strong';

  return (
    <Shell>
      <View className="flex-row items-center justify-between">
        <Pill>{index + 1} / {cards.length}</Pill>
        <Pill>{card.entry.level}</Pill>
      </View>
      <Progress value={(index / cards.length) * 100} />

      <View className="items-center py-2">
        <Text className="text-muted text-sm text-center">
          {card.direction === 'toRu'
            ? pick(`Переведите с ${fromName} на русский`, 'Translate into Russian')
            : pick(`Переведите на ${toName}`, `Translate into ${toName}`)}
        </Text>
        <Text className="text-4xl font-black text-ink py-5 text-center">{promptFor(card)}</Text>
      </View>

      <TextInput
        autoFocus
        value={answer}
        onChangeText={setAnswer}
        editable={verdict === 'none'}
        onSubmitEditing={() => (verdict === 'none' ? check() : next())}
        returnKeyType={verdict === 'none' ? 'done' : 'next'}
        placeholder={pick('Ваш перевод…', 'Your translation…')}
        placeholderTextColor={colors.placeholder}
        className={`min-h-12 border border-line rounded-2xl px-4 text-ink ${fieldTone}`}
      />

      {verdict === 'right' && (
        <View className="flex-row items-center gap-2">
          <Check size={18} color={colors.success} />
          <Text className="font-bold text-success">{pick('Верно!', 'Correct!')}</Text>
        </View>
      )}

      {verdict === 'wrong' && (
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <X size={18} color={colors.danger} />
            <Text className="font-bold text-danger flex-1">
              {pick('Правильный ответ:', 'Correct answer:')} {expected}
            </Text>
          </View>
          <Button
            variant="secondary"
            fullWidth
            disabled={alreadyAdded}
            icon={alreadyAdded ? <Check size={18} color={colors.green} /> : <Plus size={18} color={colors.green} />}
            label={alreadyAdded ? pick('Добавлено в словарь', 'Added to dictionary') : pick('Добавить это слово в словарь', 'Add this word to my dictionary')}
            onPress={addToDictionary}
          />
        </View>
      )}

      <View className="flex-row gap-3">
        <View className="flex-1"><Button fullWidth label={pick('Пропустить', 'Skip')} onPress={finish} /></View>
        <View className="flex-1">
          {verdict === 'none'
            ? <Button fullWidth variant="primary" label={pick('Проверить', 'Check')} onPress={check} />
            : <Button fullWidth variant="primary" icon={<ArrowRight size={18} color={colors.onPrimary} />} label={pick('Дальше', 'Next')} onPress={next} />}
        </View>
      </View>
    </Shell>
  );
}

function Shell({children}: {children: React.ReactNode}) {
  return (
    <View className="flex-1 bg-paper">
      <ScrollView contentContainerClassName="flex-grow justify-center p-4">
        <Card className="p-6 gap-5">{children}</Card>
      </ScrollView>
    </View>
  );
}
