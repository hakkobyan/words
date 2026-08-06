import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Check, Plus, Sparkles } from 'lucide-react-native';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { Card, Button, Select } from '@/components/ui/Parts';
import { useScreenPadding } from '@/lib/insets';
import { dataSet } from '@/lib/web';
import { useI18n } from '@/lib/i18n';
import { useThemeColors } from '@/lib/theme';
import { translateWord } from '@/lib/api';

export default function Add() {
  const s = useVocabularyStore();
  const { pick } = useI18n();
  const screenPadding = useScreenPadding();
  const colors = useThemeColors();
  const lang = s.settings.defaultLanguage;
  const [word, setWord] = useState('');
  const [tr, setTr] = useState('');
  const [cat, setCat] = useState('other');
  const [session, setSession] = useState('');
  const [example, setExample] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const [msgIsError, setMsgIsError] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const validSessions = s.sessions.filter((x) => x.language === lang);
  const activeSession = validSessions.some((x) => x.id === session) ? session : '';

  useEffect(() => {
    const clean = word.trim();
    setSuggestions([]);
    if (clean.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await translateWord(clean, lang, controller.signal);
        setSuggestions(result);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setMsg(pick('Переводчик временно недоступен. Можно ввести перевод вручную.', 'Translator is temporarily unavailable. You can type the translation yourself.'));
          setMsgIsError(false);
        }
      } finally {
        setLoading(false);
      }
    }, 550);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word, lang]);

  const save = (again = false) => {
    if (!word.trim() || !tr.trim()) {
      setMsg(pick('Заполните слово и перевод.', 'Fill in the word and translation.'));
      setMsgIsError(true);
      return;
    }
    const sid = activeSession || validSessions[0]?.id || s.addSession(`${lang === 'english' ? 'Английский' : 'Немецкий'} — ${new Date().toLocaleString('ru')}`, lang);
    if (s.words.some((w) => w.language === lang && w.word.trim().toLocaleLowerCase() === word.trim().toLocaleLowerCase())) {
      setMsg(pick('Это слово уже добавлено в ваш словарь.', 'This word is already in your dictionary.'));
      setMsgIsError(true);
      return;
    }
    s.addWord({
      language: lang,
      word: word.trim(),
      translationRu: tr.trim(),
      categoryId: cat,
      sessionId: sid,
      example,
      note,
      favorite: false,
      learned: false,
      correctAnswers: 0,
      wrongAnswers: 0,
      difficulty: 'new',
    });
    setMsg(pick('Слово сохранено.', 'Word saved.'));
    setMsgIsError(false);
    if (again) {
      setWord('');
      setTr('');
      setExample('');
      setNote('');
      setSuggestions([]);
    }
  };

  return (
    <ScrollView className="flex-1 bg-paper" {...dataSet({ screenPad: 'true' })} contentContainerStyle={screenPadding} contentContainerClassName="p-4 gap-4 pb-8">
      <Text className="text-muted">{pick('Перевод с помощью DeepL', 'Translation powered by DeepL')}</Text>
      <Text className="text-3xl font-black text-ink -mt-2 mb-2">{pick('Новое слово', 'New word')}</Text>

      <Card className="p-5 gap-5">
        <View className="gap-2">
          <Text className="font-bold text-sm text-ink">{lang === 'english' ? pick('Английское слово', 'English word') : pick('Немецкое слово', 'German word')}</Text>
          <View className="relative">
            <TextInput
              autoFocus
              value={word}
              onChangeText={(v) => {
                setWord(v);
                setMsg('');
              }}
              placeholder={lang === 'english' ? 'Например, journey' : 'Например, Reise'}
              autoCapitalize="none"
              autoCorrect={false}
              className="min-h-12 bg-card-strong border border-line rounded-2xl px-4 pr-12 text-ink"
              placeholderTextColor={colors.placeholder}
            />
            {loading && <ActivityIndicator className="absolute right-4 top-3.5" color={colors.muted} />}
          </View>
        </View>

        {suggestions.length > 0 && (
          <View className="rounded-2xl p-4 bg-mint border border-line gap-2">
            <View className="flex-row items-center gap-2 mb-1">
              <Sparkles size={17} color={colors.green} />
              <Text className="text-sm font-bold text-ink">{pick('DeepL предлагает', 'DeepL suggests')}</Text>
            </View>
            {suggestions.map((x) => (
              <Pressable
                key={x}
                onPress={() => {
                  setTr(x);
                  setMsg(pick('Перевод выбран.', 'Translation selected.'));
                }}
                className="min-h-12 bg-card-strong rounded-2xl px-4 flex-row items-center justify-between"
              >
                <Text className="text-ink">{x}</Text>
                <Check size={17} color={colors.green} />
              </Pressable>
            ))}
          </View>
        )}

        <View className="gap-2">
          <Text className="font-bold text-sm text-ink">{pick('Перевод на русский', 'Russian translation')}</Text>
          <TextInput
            value={tr}
            onChangeText={setTr}
            placeholder={pick('Выберите подсказку или напишите свой перевод', 'Choose a suggestion or enter your own translation')}
            placeholderTextColor={colors.placeholder}
            className="min-h-12 bg-card-strong border border-line rounded-2xl px-4 text-ink"
          />
        </View>

        <View className="gap-4">
          <View className="gap-2">
            <Text className="font-bold text-sm text-ink">{pick('Категория', 'Category')}</Text>
            <Select label={pick('Категория', 'Category')} value={cat} onChange={setCat} options={s.categories.map((c) => ({ value: c.id, label: c.name }))} />
          </View>
          <View className="gap-2">
            <Text className="font-bold text-sm text-ink">{pick('Сеанс', 'Session')}</Text>
            <Select
              label={pick('Сеанс', 'Session')}
              value={activeSession}
              onChange={setSession}
              options={[{ value: '', label: pick('Создать автоматически', 'Create automatically') }, ...validSessions.map((v) => ({ value: v.id, label: v.name }))]}
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="font-bold text-sm text-ink">{pick('Пример употребления', 'Usage example')}</Text>
          <TextInput value={example} onChangeText={setExample} className="min-h-12 bg-card-strong border border-line rounded-2xl px-4 text-ink" placeholderTextColor={colors.placeholder} />
        </View>

        <View className="gap-2">
          <Text className="font-bold text-sm text-ink">{pick('Заметка', 'Note')}</Text>
          <TextInput value={note} onChangeText={setNote} multiline numberOfLines={2} className="min-h-12 bg-card-strong border border-line rounded-2xl px-4 py-3 text-ink" placeholderTextColor={colors.placeholder} />
        </View>

        {!!msg && (
          <Text className="text-sm" style={{ color: msgIsError ? colors.danger : colors.muted }}>
            {msg}
          </Text>
        )}

        <View className="gap-3">
          <Button variant="secondary" icon={<Check size={18} color={colors.green} />} label={pick('Добавить слово', 'Add word')} onPress={() => save(false)} fullWidth />
          <Button variant="primary" icon={<Plus size={18} color="#fffaf4" />} label={pick('Добавить и продолжить', 'Add and continue')} onPress={() => save(true)} fullWidth />
        </View>
      </Card>
    </ScrollView>
  );
}
