import { useState } from 'react';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
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
import { CEFR_LEVELS, CefrLevel } from '@/types';

export default function Settings() {
  const store = useVocabularyStore();
  const { locale, pick } = useI18n();
  const colors = useThemeColors();
  const [message, setMessage] = useState('');

  const toggles = [
    ['showExamples', pick('Показывать примеры', 'Show examples')],
    ['shuffle', pick('Перемешивать слова', 'Shuffle words')],
    ['reverse', pick('Обратные вопросы', 'Reverse questions')],
    ['autoCategory', pick('Автокатегории', 'Automatic categories')],
  ] as const;

  const exportData = async () => {
    try {
      const payload = backupPayload({ words: store.words, categories: store.categories, sessions: store.sessions, settings: store.settings });
      const file = new File(Paths.cache, `vocabulary-backup-${new Date().toISOString().slice(0, 10)}.json`);
      if (file.exists) file.delete();
      file.create();
      file.write(payload);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
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
    Alert.alert(
      pick('Удалить все данные?', 'Delete all data?'),
      pick('Это действие необратимо.', 'This action cannot be undone.'),
      [
        { text: pick('Отмена', 'Cancel'), style: 'cancel' },
        { text: pick('Удалить', 'Delete'), style: 'destructive', onPress: store.clear },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerClassName="p-4 gap-4 pb-8">
      <Text className="text-muted">{pick('Персонализация и данные', 'Personalization and data')}</Text>
      <Text className="text-3xl font-black text-ink -mt-2 mb-2">{pick('Настройки', 'Settings')}</Text>

      <Card className="p-5 gap-5">
        <Text className="font-bold text-lg text-ink">{pick('Внешний вид', 'Appearance')}</Text>
        <View className="gap-2">
          <Text className="font-bold text-sm text-ink">{pick('Язык интерфейса', 'Interface language')}</Text>
          <Select
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
          <Text className="font-bold text-sm text-ink">{pick('Ваш текущий уровень', 'Your current level')}</Text>
          <Select
            value={store.settings.learnerLevel}
            onChange={(v: CefrLevel) => store.setSettings({ learnerLevel: v })}
            options={CEFR_LEVELS.map((level) => ({ value: level, label: level }))}
          />
          <Text className="text-muted text-xs">
            {pick('YouTube Vocabulary сначала показывает уровень выше выбранного.', 'YouTube Vocabulary starts with levels above this selection.')}
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
              trackColor={{ false: colors.line, true: colors.green }}
              thumbColor={colors.cardStrong}
            />
          </View>
        ))}
      </Card>

      <Card className="p-5 gap-4">
        <Text className="font-bold text-lg text-ink">{pick('Мои данные', 'My data')}</Text>
        <View className="gap-3">
          <Button variant="secondary" icon={<Download size={18} color={colors.green} />} label={pick('Экспорт JSON', 'Export JSON')} onPress={exportData} fullWidth />
          <Button variant="secondary" icon={<Upload size={18} color={colors.green} />} label={pick('Импорт JSON', 'Import JSON')} onPress={importData} fullWidth />
          <Button variant="border" icon={<RotateCcw size={18} color={colors.ink} />} label={pick('Сбросить прогресс', 'Reset progress')} onPress={confirmReset} fullWidth />
          <Button variant="danger" icon={<Trash2 size={18} color="#fff" />} label={pick('Удалить все данные', 'Delete all data')} onPress={confirmClear} fullWidth />
        </View>
        {!!message && <Text className="text-muted mt-2">{message}</Text>}
      </Card>
    </ScrollView>
  );
}
