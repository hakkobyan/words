import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Flame, HelpCircle, Layers, Sparkles } from 'lucide-react-native';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { Card } from '@/components/ui/Parts';
import { useScreenPadding } from '@/lib/insets';
import { dataSet } from '@/lib/web';
import { useI18n } from '@/lib/i18n';
import { useThemeColors } from '@/lib/theme';

export default function Study() {
  const s = useVocabularyStore();
  const { pick } = useI18n();
  const screenPadding = useScreenPadding();
  const colors = useThemeColors();
  const languageWords = s.words.filter((w) => w.language === s.settings.defaultLanguage);
  const due = languageWords.filter((w) => !w.nextReviewAt || new Date(w.nextReviewAt) <= new Date()).length;
  const languageName = s.settings.defaultLanguage === 'english' ? pick('английских', 'English') : pick('немецких', 'German');

  const modes = [
    [Sparkles, pick('Охота за словом', 'Word Hunt'), pick('Находите скрытые слова по смыслу, изучайте их и закрепляйте на практике', 'Discover hidden words by meaning, learn them, and make them stick'), '/explore'],
    [Layers, pick('Флеш-карточки', 'Flashcards'), pick('Переворачивайте карточки и оценивайте знание', 'Flip cards and rate your knowledge'), '/study/flashcards'],
    [HelpCircle, pick('Квиз', 'Quiz'), pick('Выберите правильный перевод из четырёх вариантов', 'Choose the correct translation from four options'), '/study/quiz'],
  ] as const;

  return (
    <ScrollView className="flex-1 bg-paper" {...dataSet({ screenPad: 'true' })} contentContainerStyle={screenPadding} contentContainerClassName="w-full max-w-[720px] self-center px-4 pt-5 gap-4 pb-8">
      <View className="gap-4">
        <View>
          <Text className="text-muted">{pick('Выберите формат', 'Choose a mode')}</Text>
          <Text className="text-3xl font-black text-ink">{pick('Тренировка', 'Study')}</Text>
        </View>
      </View>

      <Card className="p-4 flex-row items-center gap-3">
        <View className="bg-mint p-3 rounded-2xl">
          <Flame color={colors.green} />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-ink">
            {due} {languageName} {pick('слов на повторение', 'words to review')}
          </Text>
          <Text className="text-muted text-sm">{pick('Язык обучения меняется в настройках', 'Change the learning language in settings')}</Text>
        </View>
      </Card>

      <View className="gap-4">
        {modes.map(([Icon, title, text, href]) => (
          <Pressable key={title} onPress={() => router.push(href)}>
            <Card className="p-4">
              <View className="bg-mint self-start p-3 rounded-2xl">
                <Icon size={28} color={colors.green} />
              </View>
              <Text className="font-bold text-xl text-ink mt-5">{title}</Text>
              <Text className="text-muted mt-2 mb-5">{text}</Text>
              <View className="flex-row items-center gap-2">
                <Text className="font-bold text-green">{pick('Начать', 'Start')}</Text>
                <ArrowRight size={18} color={colors.green} />
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
