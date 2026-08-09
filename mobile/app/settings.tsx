import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Download, RotateCcw, Trash2, Upload } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import Slider from '@react-native-community/slider';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { backupPayload } from '@/lib/storage';
import { Card, Button, Select } from '@/components/ui/Parts';
import { useI18n } from '@/lib/i18n';
import { useThemeColors } from '@/lib/theme';
import { CEFR_LEVELS, CefrLevel, StudyLanguage, WordHuntLevel } from '@/types';

export default function Settings() {
  const store = useVocabularyStore();
  const { locale, pick } = useI18n();
  const colors = useThemeColors();
  const [message, setMessage] = useState('');
  const [confirmation, setConfirmation] = useState<'reset' | 'clear' | null>(null);

  const toggles = [
    ['showExamples', pick('Показывать примеры', 'Show examples')],
    ['shuffle', pick('Перемешивать слова', 'Shuffle words')],
    ['reverse', pick('Обратные вопросы', 'Reverse questions')],
    ['autoCategory', pick('Автокатегории', 'Automatic categories')],
  ] as const;

  const exportData = async () => {
    try {
      const payload = backupPayload({ words: store.words, categories: store.categories, sessions: store.sessions, settings: store.settings });
      const filename = `vocabulary-backup-${new Date().toISOString().slice(0, 10)}.json`;
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
        setMessage(pick('Резервная копия скачана.', 'Backup downloaded.'));
        return;
      }
      const file = new File(Paths.cache, filename);
      if (file.exists) file.delete();
      file.create();
      file.write(payload);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
        setMessage(pick('Резервная копия готова.', 'Backup is ready.'));
      } else {
        throw new Error('SHARING_UNAVAILABLE');
      }
    } catch {
      setMessage(pick('Не удалось экспортировать данные.', 'Could not export data.'));
    }
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled) return;
      const data = JSON.parse(await new File(result.assets[0].uri).text());
      if (!Array.isArray(data.words) || !Array.isArray(data.categories) || !Array.isArray(data.sessions)) throw new Error('INVALID_BACKUP');
      store.replaceData(data);
      setMessage(pick(`Импортировано ${data.words.length} слов`, `Imported ${data.words.length} words`));
    } catch {
      setMessage(pick('Некорректный файл резервной копии', 'Invalid backup file'));
    }
  };

  const confirmReset = () => {
    if (Platform.OS === 'web') {
      setConfirmation('reset');
      return;
    }
    Alert.alert(
      pick('Сбросить прогресс?', 'Reset progress?'),
      pick('Все слова останутся, но прогресс изучения обнулится.', 'All words will stay, but learning progress will be reset.'),
      [
        { text: pick('Отмена', 'Cancel'), style: 'cancel' },
        { text: pick('Сбросить', 'Reset'), style: 'destructive', onPress: store.resetProgress },
      ]
    );
  };

  const confirmClear = () => {
    if (Platform.OS === 'web') {
      setConfirmation('clear');
      return;
    }
    Alert.alert(
      pick('Удалить все данные?', 'Delete all data?'),
      pick('Это действие необратимо.', 'This action cannot be undone.'),
      [
        { text: pick('Отмена', 'Cancel'), style: 'cancel' },
        { text: pick('Удалить', 'Delete'), style: 'destructive', onPress: store.clear },
      ]
    );
  };

  const applyDestructiveAction = () => {
    if (confirmation === 'reset') {
      store.resetProgress();
      setMessage(pick('Прогресс сброшен.', 'Progress reset.'));
    } else if (confirmation === 'clear') {
      store.clear();
      setMessage(pick('Все данные удалены.', 'All data deleted.'));
    }
    setConfirmation(null);
  };

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerClassName="w-full max-w-[720px] self-center px-5 py-6 gap-5 pb-8">
      <Text className="text-muted">{pick('Персонализация и данные', 'Personalization and data')}</Text>
      <Text className="text-3xl font-black text-ink -mt-2 mb-2">{pick('Настройки', 'Settings')}</Text>

      <Card className="p-5 gap-5">
        <Text className="font-bold text-lg text-ink">{pick('Внешний вид', 'Appearance')}</Text>
        <View className="gap-2">
          <Text className="font-bold text-sm text-ink">{pick('Язык интерфейса', 'Interface language')}</Text>
          <Select
            label={pick('Язык интерфейса', 'Interface language')}
            value={locale}
            onChange={(v) => store.setSettings({ interfaceLanguage: v })}
            options={[
              { value: 'ru', label: 'Русский' },
              { value: 'en', label: 'English' },
            ]}
          />
        </View>
        <View className="gap-2">
          <Text className="font-bold text-sm text-ink">{pick('Тема', 'Theme')}</Text>
          <Select
            label={pick('Тема', 'Theme')}
            value={store.settings.theme}
            onChange={(v) => store.setSettings({ theme: v })}
            options={[
              { value: 'system', label: pick('Как в системе', 'System') },
              { value: 'light', label: pick('Светлая', 'Light') },
              { value: 'dark', label: pick('Тёмная', 'Dark') },
            ]}
          />
        </View>
      </Card>

      <Card className="p-5 gap-5">
        <Text className="font-bold text-lg text-ink">{pick('Обучение', 'Learning')}</Text>
        <View className="gap-2">
          <Text className="font-bold text-sm text-ink">{pick('Язык обучения', 'Learning language')}</Text>
          <Select
            label={pick('Язык обучения', 'Learning language')}
            value={store.settings.defaultLanguage}
            onChange={(v: StudyLanguage) => store.setSettings({ defaultLanguage: v })}
            options={[
              { value: 'english' as StudyLanguage, label: pick('Английский', 'English') },
              { value: 'german' as StudyLanguage, label: pick('Немецкий', 'German') },
            ]}
          />
          <Text className="text-muted text-xs">
            {pick('Слова, тренировки и YouTube используют этот язык.', 'Words, study sessions and YouTube use this language.')}
          </Text>
        </View>
        <View className="gap-2">
          <Text className="font-bold text-sm text-ink">{pick('Ваш текущий уровень', 'Your current level')}</Text>
          <Select
            label={pick('Ваш текущий уровень', 'Your current level')}
            value={store.settings.learnerLevel}
            onChange={(v: CefrLevel) => store.setSettings({ learnerLevel: v })}
            options={CEFR_LEVELS.map((level) => ({ value: level, label: level }))}
          />
          <Text className="text-muted text-xs">
            {pick('YouTube Vocabulary сначала показывает уровень выше выбранного.', 'YouTube Vocabulary starts with levels above this selection.')}
          </Text>
        </View>
        <View className="gap-2">
          <Text className="font-bold text-sm text-ink">{pick('Уровень слов в Word Hunt', 'Word Hunt level')}</Text>
          <Select
            label={pick('Уровень слов в Word Hunt', 'Word Hunt level')}
            value={store.settings.wordHuntLevel}
            onChange={(v: WordHuntLevel) => store.setSettings({ wordHuntLevel: v })}
            options={[
              { value: 'mixed' as WordHuntLevel, label: pick('Все уровни · A1–C2', 'All levels · A1–C2') },
              { value: 'A1' as WordHuntLevel, label: 'A1' },
              { value: 'A2' as WordHuntLevel, label: 'A2' },
              { value: 'B1' as WordHuntLevel, label: 'B1' },
              { value: 'B2' as WordHuntLevel, label: 'B2' },
              { value: 'C1' as WordHuntLevel, label: 'C1' },
              { value: 'C2' as WordHuntLevel, label: 'C2' },
            ]}
          />
          <Text className="text-muted text-xs">
            {pick('Word Hunt будет подбирать ежедневные слова выбранного уровня.', 'Word Hunt will use daily words from the selected level.')}
          </Text>
        </View>
        <View className="gap-2">
          <Text className="text-ink">
            {pick('Карточек за сеанс', 'Cards per session')}: {store.settings.cardsPerSession}
          </Text>
          <Slider
            minimumValue={5}
            maximumValue={50}
            step={1}
            value={store.settings.cardsPerSession}
            onSlidingComplete={(v: number) => store.setSettings({ cardsPerSession: Math.round(v) })}
            minimumTrackTintColor={colors.orange}
            maximumTrackTintColor={colors.line}
            thumbTintColor={colors.orange}
          />
        </View>
        {toggles.map(([key, label]) => (
          <View className="flex-row justify-between items-center" key={key}>
            <Text className="text-ink">{label}</Text>
            <Switch
              value={store.settings[key]}
              onValueChange={(v) => store.setSettings({ [key]: v })}
              trackColor={{ false: colors.line, true: colors.plum }}
              thumbColor={colors.cardStrong}
            />
          </View>
        ))}
      </Card>

      <Card className="p-5 gap-4">
        <Text className="font-bold text-lg text-ink">{pick('Мои данные', 'My data')}</Text>
        <View className="gap-3">
          <Button variant="secondary" icon={<Download size={18} color={colors.plum} />} label={pick('Экспорт JSON', 'Export JSON')} onPress={exportData} fullWidth />
          <Button variant="secondary" icon={<Upload size={18} color={colors.plum} />} label={pick('Импорт JSON', 'Import JSON')} onPress={importData} fullWidth />
          <Button variant="border" icon={<RotateCcw size={18} color={colors.ink} />} label={pick('Сбросить прогресс', 'Reset progress')} onPress={confirmReset} fullWidth />
          <Button variant="danger" icon={<Trash2 size={18} color="#fff" />} label={pick('Удалить все данные', 'Delete all data')} onPress={confirmClear} fullWidth />
        </View>
        {!!message && <Text className="text-muted mt-2">{message}</Text>}
      </Card>

      <Modal visible={confirmation !== null} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setConfirmation(null)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={pick('Закрыть подтверждение', 'Close confirmation')}
          onPress={() => setConfirmation(null)}
          className="flex-1 bg-black/60 px-5 items-center justify-center"
        >
          <Pressable onPress={() => {}} className="w-full max-w-[440px]">
            <Card className="p-5 gap-4">
              <View className="gap-2">
                <Text className="text-xl font-black text-ink">
                  {confirmation === 'reset' ? pick('Сбросить прогресс?', 'Reset progress?') : pick('Удалить все данные?', 'Delete all data?')}
                </Text>
                <Text className="text-muted leading-6">
                  {confirmation === 'reset'
                    ? pick('Все слова останутся, но прогресс изучения обнулится.', 'All words will stay, but learning progress will be reset.')
                    : pick('Это действие необратимо.', 'This action cannot be undone.')}
                </Text>
              </View>
              <View className="flex-row gap-3">
                <Button variant="border" className="flex-1" label={pick('Отмена', 'Cancel')} onPress={() => setConfirmation(null)} />
                <Button
                  variant="danger"
                  className="flex-1"
                  label={confirmation === 'reset' ? pick('Сбросить', 'Reset') : pick('Удалить', 'Delete')}
                  onPress={applyDestructiveAction}
                />
              </View>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
