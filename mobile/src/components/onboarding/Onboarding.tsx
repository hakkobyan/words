import {useState} from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {BookOpen, Check, ClipboardList, Sparkles} from 'lucide-react-native';
import {useVocabularyStore} from '@/store/useVocabularyStore';
import {useI18n} from '@/lib/i18n';
import {useThemeColors} from '@/lib/theme';
import {Button, Card, LanguageSelector, Pill, Progress} from '@/components/ui/Parts';
import {levelTestWords, scoreToLevel} from '@/data/levelTest';
import {isCorrectAnswer} from '@/lib/answers';
import {dailySession} from '@/lib/dailyWords';
import {CEFR_LEVELS, CefrLevel, StudyLanguage} from '@/types';
import {useStandaloneScreenPadding} from '@/lib/insets';

const levelHints: Record<CefrLevel, [string, string]> = {
  A1: ['Начинающий', 'Beginner'],
  A2: ['Элементарный', 'Elementary'],
  B1: ['Средний', 'Intermediate'],
  B2: ['Выше среднего', 'Upper-intermediate'],
  C1: ['Продвинутый', 'Advanced'],
  C2: ['В совершенстве', 'Proficient'],
};

type Step = 'welcome' | 'method' | 'manual' | 'test' | 'result';

export default function Onboarding() {
  const setSettings = useVocabularyStore((s) => s.setSettings);
  const {pick} = useI18n();
  const colors = useThemeColors();
  const safePadding = useStandaloneScreenPadding(32);
  const [step, setStep] = useState<Step>('welcome');
  const [language, setLanguage] = useState<StudyLanguage>('english');
  const [testIndex, setTestIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [resultLevel, setResultLevel] = useState<CefrLevel>('B1');

  const words = levelTestWords[language];
  const stepNumber = step === 'welcome' ? 1 : step === 'method' || step === 'manual' ? 2 : 3;

  const finish = (level: CefrLevel) => {
    // The level test already covered plenty of typing — start the daily warm-up next launch.
    dailySession.markHandled();
    setSettings({defaultLanguage: language, learnerLevel: level, onboardingCompleted: true});
  };

  const submitTestAnswer = () => {
    const nextScore = score + (isCorrectAnswer(answer, words[testIndex].answers) ? 1 : 0);
    setScore(nextScore);
    setAnswer('');
    if (testIndex + 1 < words.length) {
      setTestIndex(testIndex + 1);
    } else {
      setResultLevel(scoreToLevel(nextScore));
      setStep('result');
    }
  };

  return (
    <View className="flex-1 bg-paper">
      <ScrollView contentContainerStyle={safePadding} contentContainerClassName="flex-grow justify-center px-4">
        <View className="w-full max-w-[520px] self-center gap-5">
          <View className="flex-row items-center justify-between px-1">
            <View className="flex-row items-center gap-2">
              <View className="w-9 h-9 rounded-xl bg-primary-bg items-center justify-center">
                <BookOpen size={19} color={colors.cardStrong} />
              </View>
              <Text className="text-ink text-lg font-black">FlipFox</Text>
            </View>
            <Text className="text-muted text-xs font-bold">{stepNumber} / 3</Text>
          </View>
          <View className="flex-row gap-2 px-1">
            {[1,2,3].map(n=><View key={n} className={`h-1.5 flex-1 rounded-full ${n<=stepNumber?'bg-orange':'bg-paper-2'}`}/>) }
          </View>
        <Card className="p-6 gap-5 rounded-[28px]">
          {step === 'welcome' && (
            <>
              <View className="bg-mint rounded-[20px] p-3.5 self-start"><Sparkles size={28} color={colors.green} /></View>
              <View className="gap-2">
                <Text className="text-[34px] leading-[40px] font-black text-ink">{pick('Учите слова без зубрёжки', 'Learn words without cramming')}</Text>
                <Text className="text-muted text-base leading-6">{pick('Соберём личный словарь и подберём короткие тренировки под ваш уровень.', 'Build a personal vocabulary and get short sessions matched to your level.')}</Text>
              </View>
              <View className="flex-row gap-2 flex-wrap">
                {[pick('5 минут в день','5 min a day'),pick('Свой темп','Your pace'),pick('Без регистрации','No sign-up')].map(item=><View key={item} className="flex-row items-center gap-1.5 bg-paper-2 rounded-full px-3 py-2"><Check size={14} color={colors.success}/><Text className="text-ink text-xs font-bold">{item}</Text></View>)}
              </View>
              <Text className="text-ink font-bold mt-1">{pick('Какой язык вы учите?', 'Which language are you learning?')}</Text>
              <LanguageSelector value={language} onChange={setLanguage} />
              <Button variant="primary" fullWidth label={pick('Продолжить', 'Continue')} onPress={() => setStep('method')} />
            </>
          )}

          {step === 'method' && (
            <>
              <Text className="text-2xl font-black text-ink">{pick('Ваш уровень', 'Your level')}</Text>
              <Text className="text-muted">{pick('Как определим ваш уровень владения языком?', 'How should we work out your level?')}</Text>
              <Pressable onPress={() => setStep('test')} accessibilityRole="button"
                className="bg-mint border border-line rounded-2xl p-5 flex-row items-center gap-3">
                <ClipboardList size={22} color={colors.green} />
                <View className="flex-1">
                  <Text className="font-bold text-on-secondary">{pick('Пройти тест', 'Take a test')}</Text>
                  <Text className="text-muted text-sm">{pick('20 слов разных уровней — переведите их', '20 words of different levels — translate them')}</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setStep('manual')} accessibilityRole="button"
                className="border border-line rounded-2xl p-5 flex-row items-center gap-3">
                <Sparkles size={22} color={colors.green} />
                <View className="flex-1">
                  <Text className="font-bold text-ink">{pick('Указать самому', 'Set it myself')}</Text>
                  <Text className="text-muted text-sm">{pick('Я знаю свой уровень CEFR', 'I already know my CEFR level')}</Text>
                </View>
              </Pressable>
            </>
          )}

          {step === 'manual' && (
            <>
              <Text className="text-2xl font-black text-ink">{pick('Выберите уровень', 'Choose your level')}</Text>
              <View className="flex-row flex-wrap gap-3">
                {CEFR_LEVELS.map((level) => (
                  <Pressable key={level} onPress={() => finish(level)} accessibilityRole="button"
                    className="border border-line rounded-2xl py-4 px-3 flex-grow basis-[45%]">
                    <Text className="font-black text-xl text-ink">{level}</Text>
                    <Text className="text-muted text-xs">{pick(...levelHints[level])}</Text>
                  </Pressable>
                ))}
              </View>
              <Button fullWidth label={pick('Назад', 'Back')} onPress={() => setStep('method')} />
            </>
          )}

          {step === 'test' && (
            <>
              <View className="flex-row items-center justify-between">
                <Pill>{testIndex + 1} / {words.length}</Pill>
                <Text className="text-muted text-sm flex-shrink" numberOfLines={2}>
                  {pick('Переведите слово на русский', 'Translate the word into Russian')}
                </Text>
              </View>
              <Progress value={(testIndex / words.length) * 100} />
              <Text className="text-4xl font-black text-ink text-center py-6">{words[testIndex].word}</Text>
              <TextInput
                autoFocus
                value={answer}
                onChangeText={setAnswer}
                onSubmitEditing={submitTestAnswer}
                returnKeyType="next"
                placeholder={pick('Ваш перевод…', 'Your translation…')}
                placeholderTextColor={colors.placeholder}
                className="min-h-12 bg-card-strong border border-line rounded-2xl px-4 text-ink"
              />
              <View className="flex-row gap-3">
                <View className="flex-1"><Button fullWidth label={pick('Пропустить', 'Skip')} onPress={submitTestAnswer} /></View>
                <View className="flex-1"><Button fullWidth variant="primary" label={pick('Дальше', 'Next')} onPress={submitTestAnswer} /></View>
              </View>
            </>
          )}

          {step === 'result' && (
            <>
              <View className="bg-mint rounded-2xl p-3 self-center"><Sparkles size={26} color={colors.green} /></View>
              <Text className="text-2xl font-black text-ink text-center">{pick('Ваш уровень', 'Your level')}</Text>
              <Text className="text-5xl font-black text-green text-center">{resultLevel}</Text>
              <Text className="text-muted text-center">
                {pick(`Правильно: ${score} из ${words.length}. `, `Correct: ${score} of ${words.length}. `)}
                {pick(...levelHints[resultLevel])}
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1"><Button fullWidth label={pick('Изменить', 'Change')} onPress={() => setStep('manual')} /></View>
                <View className="flex-1"><Button fullWidth variant="primary" label={pick('Начать', 'Start')} onPress={() => finish(resultLevel)} /></View>
              </View>
            </>
          )}
        </Card>
        <Text className="text-muted text-xs text-center px-8">{pick('Настройки можно изменить позже', 'You can change these settings later')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
