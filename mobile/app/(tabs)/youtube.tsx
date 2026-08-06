import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Speech from 'expo-speech';
import { Captions, Check, Clock3, ExternalLink, Filter, Languages, Play, Plus, RefreshCw, Sparkles, Video } from 'lucide-react-native';
import YouTubeVocabularyCard from '@/components/youtube/YouTubeVocabularyCard';
import { CEFR_RANK, formatDuration, nextCefrLevel, parseYoutubeUrl, VideoAnalysis, VideoVocabularyItem } from '@/lib/youtube-vocabulary';
import { CEFR_LEVELS, CefrLevel } from '@/types';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { analyzeYoutubeVideo } from '@/lib/api';
import { Card, Button, Select } from '@/components/ui/Parts';
import { useThemeColors } from '@/lib/theme';

const loadingSteps = ['Downloading subtitles…', 'Detecting language…', 'Finding useful vocabulary…', 'Translating words…', 'Preparing lesson…'];
const errors: Record<string, { title: string; text: string }> = {
  INVALID_URL: { title: 'Enter a valid YouTube link', text: 'Paste a public YouTube watch, short, live, or share URL and try again.' },
  PRIVATE_VIDEO: { title: 'This video is not available', text: 'It may be private, deleted, or unavailable in your region.' },
  VIDEO_UNAVAILABLE: { title: 'This video is not available', text: 'It may be private, deleted, or unavailable in your region.' },
  NO_SUBTITLES: { title: 'No subtitles were found for this video', text: 'Try another video with captions in your learning language.' },
  CAPTION_FETCH_BLOCKED: {
    title: 'YouTube blocked this request',
    text: 'YouTube is rate-limiting caption requests from this server. This usually resolves on retry after a short wait. It is not an issue with this specific video.',
  },
  UNSUPPORTED_LANGUAGE: { title: 'This subtitle language is unsupported', text: 'Choose English or German, then try a video with matching captions.' },
  NO_USEFUL_VOCABULARY: { title: 'No useful vocabulary was found', text: 'The captions contain no curated terms at this level. Try a longer or more detailed video.' },
  TIMEOUT: { title: 'The request took too long', text: 'YouTube did not respond in time. Please try again.' },
  NETWORK_ERROR: { title: 'Could not reach YouTube', text: 'Check your connection and try again.' },
};
type PartFilter = 'all' | 'Verb' | 'Noun' | 'Adjective';

const wordKey = (word: string) => word.trim().toLocaleLowerCase();

function FilterChip({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="min-h-12 rounded-2xl px-4 flex-row items-center gap-3 bg-card-strong border border-line"
    >
      <View className="w-5 h-5 rounded-[6px] items-center justify-center border" style={{ borderColor: colors.line, backgroundColor: checked ? colors.green : 'transparent' }}>
        {checked && <Check size={14} color="#fffaf4" />}
      </View>
      <Text className="text-ink flex-1">{label}</Text>
    </Pressable>
  );
}

export default function YouTubeVocabulary() {
  const store = useVocabularyStore();
  const colors = useThemeColors();
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'results' | 'error'>('idle');
  const [errorCode, setErrorCode] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [minimumLevel, setMinimumLevel] = useState<CefrLevel>(nextCefrLevel(store.settings.learnerLevel));
  const [onlyUnknown, setOnlyUnknown] = useState(true);
  const [onlyB2Plus, setOnlyB2Plus] = useState(false);
  const [partFilter, setPartFilter] = useState<PartFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [ignoredIds, setIgnoredIds] = useState<string[]>([]);
  const [videoSessionId, setVideoSessionId] = useState('');
  const [notice, setNotice] = useState('');
  const language = store.settings.defaultLanguage;
  const knownByWord = useMemo(
    () => new Map(store.words.filter((word) => word.language === language).map((word) => [wordKey(word.word), word])),
    [store.words, language]
  );

  useEffect(() => {
    if (state !== 'loading') return;
    setLoadingStep(0);
    const timer = setInterval(() => setLoadingStep((step) => (step + 1) % loadingSteps.length), 900);
    return () => clearInterval(timer);
  }, [state]);

  useEffect(() => {
    setMinimumLevel(nextCefrLevel(store.settings.learnerLevel));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.settings.learnerLevel]);

  const visibleVocabulary = useMemo(() => {
    if (!analysis) return [];
    const cutoff = Math.max(CEFR_RANK[minimumLevel], onlyB2Plus ? CEFR_RANK.B2 : 0);
    return analysis.vocabulary.filter(
      (item) => !ignoredIds.includes(item.id) && CEFR_RANK[item.level] >= cutoff && (!onlyUnknown || !knownByWord.has(wordKey(item.word))) && (partFilter === 'all' || item.partOfSpeech === partFilter)
    );
  }, [analysis, ignoredIds, knownByWord, minimumLevel, onlyB2Plus, onlyUnknown, partFilter]);
  const selectableVisible = visibleVocabulary.filter((item) => !knownByWord.has(wordKey(item.word)));
  const selectedItems = (analysis?.vocabulary || []).filter((item) => selectedIds.includes(item.id) && !knownByWord.has(wordKey(item.word)) && !ignoredIds.includes(item.id));
  const knownCount = analysis?.vocabulary.filter((item) => knownByWord.has(wordKey(item.word))).length || 0;

  async function analyze() {
    if (!parseYoutubeUrl(url)) {
      setErrorCode('INVALID_URL');
      setState('error');
      return;
    }
    setState('loading');
    setErrorCode('');
    setNotice('');
    setAnalysis(null);
    setSelectedIds([]);
    setIgnoredIds([]);
    setVideoSessionId('');
    try {
      const data = await analyzeYoutubeVideo(url, language);
      setAnalysis(data);
      setSelectedIds(data.vocabulary.filter((item) => !knownByWord.has(wordKey(item.word))).map((item) => item.id));
      setState('results');
    } catch (error) {
      setErrorCode(error instanceof Error ? error.message : 'NETWORK_ERROR');
      setState('error');
    }
  }

  function addItems(items: VideoVocabularyItem[]) {
    if (!analysis) return;
    const newItems = items.filter((item) => !knownByWord.has(wordKey(item.word)));
    if (!newItems.length) {
      setNotice('These words are already in your dictionary.');
      return;
    }
    const sessionId = videoSessionId || store.addSession(`YouTube · ${analysis.video.title}`, language);
    setVideoSessionId(sessionId);
    store.addWords(
      newItems.map((item) => ({
        language,
        word: item.word,
        translationRu: item.translationRu,
        categoryId: store.settings.autoCategory ? item.categoryId : 'other',
        sessionId,
        example: item.example,
        exampleTranslationRu: item.exampleTranslationRu,
        pronunciation: item.pronunciation,
        partOfSpeech: item.partOfSpeech,
        cefrLevel: item.level,
        explanation: item.explanation,
        synonyms: item.synonyms,
        antonyms: item.antonyms,
        source: 'youtube',
        sourceVideoTitle: analysis.video.title,
        sourceVideoUrl: analysis.video.url,
        sourceTimestampSeconds: item.timestampSeconds,
        favorite: false,
        learned: false,
        correctAnswers: 0,
        wrongAnswers: 0,
        difficulty: 'new',
      }))
    );
    setSelectedIds((ids) => ids.filter((id) => !newItems.some((item) => item.id === id)));
    setNotice(`${newItems.length} ${newItems.length === 1 ? 'word was' : 'words were'} added to your dictionary.`);
  }

  function playPronunciation(item: VideoVocabularyItem) {
    Speech.stop();
    Speech.speak(item.word, { language: language === 'english' ? 'en-US' : 'de-DE' });
  }

  function reviewAgain(item: VideoVocabularyItem) {
    const known = knownByWord.get(wordKey(item.word));
    if (!known) return;
    store.updateWord(known.id, { learned: false, nextReviewAt: new Date().toISOString() });
    setNotice(`${item.word} is ready to review again.`);
  }

  const activeError = errors[errorCode] || errors.NETWORK_ERROR;

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerClassName="p-4 gap-7 pb-8">
      <View>
        <Text className="text-muted text-sm mb-1">Learn from real content</Text>
        <Text className="text-3xl font-black text-ink tracking-tight">YouTube Vocabulary</Text>
        <Text className="text-muted mt-3 text-lg">Paste any YouTube video link and automatically generate a vocabulary list from its subtitles.</Text>
      </View>

      <Card className="p-5 gap-4">
        <Text className="font-bold text-ink">Paste YouTube URL</Text>
        <View className="relative">
          <View className="absolute left-4 top-3.5 z-10">
            <Video size={20} color={colors.muted} />
          </View>
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="https://youtube.com/watch?v=…"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={state !== 'loading'}
            className="pl-11 min-h-12 bg-card-strong border border-line rounded-2xl px-4 text-ink"
          />
        </View>
        <Button
          variant="primary"
          icon={state === 'loading' ? <ActivityIndicator color="#fffaf4" /> : <Sparkles size={20} color="#fffaf4" />}
          label={state === 'loading' ? 'Analyzing…' : 'Analyze video'}
          onPress={analyze}
          disabled={state === 'loading'}
          fullWidth
        />
        <View className="flex-row items-center gap-2">
          <Languages size={16} color={colors.muted} />
          <Text className="text-muted text-sm">Captions are analyzed in {language === 'english' ? 'English' : 'German'}.</Text>
        </View>
      </Card>

      {state === 'loading' && (
        <Card className="p-6 bg-hero-bg">
          <Text className="text-hero-text text-2xl font-black">{loadingSteps[loadingStep]}</Text>
          <Text className="text-hero-text mt-2 opacity-85">We are curating useful terms, not simply listing every word.</Text>
        </Card>
      )}

      {state === 'error' && (
        <Card className="p-7 items-center">
          <View className="bg-mint p-4 rounded-2xl mb-4">
            <Captions size={28} color={colors.green} />
          </View>
          <Text className="text-xl font-black text-ink text-center">{activeError.title}</Text>
          <Text className="text-muted mt-2 text-center">{activeError.text}</Text>
          <Button
            variant="primary"
            icon={<RefreshCw size={18} color="#fffaf4" />}
            label="Try another video"
            onPress={() => {
              setState('idle');
              setErrorCode('');
            }}
            className="mt-5"
          />
        </Card>
      )}

      {state === 'results' && analysis && (
        <>
          <Card className="p-5 gap-4">
            <View className="flex-row gap-4 items-center">
              <View className="bg-mint rounded-2xl p-4">
                <Video size={27} color={colors.green} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-muted text-sm">Video analyzed</Text>
                <Pressable onPress={() => Linking.openURL(analysis.video.url)}>
                  <View className="flex-row items-center gap-2">
                    <Text className="font-black text-xl text-ink" numberOfLines={2}>
                      {analysis.video.title}
                    </Text>
                    <ExternalLink size={17} color={colors.ink} />
                  </View>
                </Pressable>
                <Text className="text-muted text-sm mt-1">{analysis.transcriptWordCount.toLocaleString()} subtitle words processed</Text>
              </View>
            </View>
            <Button variant="secondary" icon={<Play size={18} color={colors.green} />} label="Open video" onPress={() => Linking.openURL(analysis.video.url)} />
            <View className="flex-row flex-wrap gap-3 pt-3 border-t border-line">
              {[
                [Clock3, formatDuration(analysis.video.durationSeconds) || '—', 'Duration'],
                [Languages, analysis.video.language.toUpperCase(), 'Language'],
                [Captions, 'Available', 'Subtitles'],
                [Sparkles, String(analysis.vocabulary.length), 'Useful words'],
              ].map(([Icon, value, label]) => {
                const Metric = Icon as typeof Clock3;
                return (
                  <View key={label as string} style={{ width: '47%' }}>
                    <Metric size={17} color={colors.muted} />
                    <Text className="font-bold text-lg text-ink mt-2">{value as string}</Text>
                    <Text className="text-muted text-xs">{label as string}</Text>
                  </View>
                );
              })}
            </View>
          </Card>

          <Card className="p-5 gap-5">
            <View>
              <Text className="text-muted text-sm">Found</Text>
              <Text className="text-2xl font-black text-ink">
                {analysis.vocabulary.length} useful words{' '}
                <Text className="text-muted text-base font-medium">
                  · {knownCount} already known · {analysis.vocabulary.length - knownCount} new
                </Text>
              </Text>
            </View>
            <View className="flex-row gap-3">
              <Button
                variant="secondary"
                icon={<Plus size={18} color={colors.green} />}
                label={`Add selected (${selectedItems.length})`}
                onPress={() => addItems(selectedItems)}
                disabled={!selectedItems.length}
                className="flex-1"
              />
              <Button
                variant="primary"
                icon={<Check size={18} color="#fffaf4" />}
                label="Add all"
                onPress={() => addItems(analysis.vocabulary.filter((item) => !ignoredIds.includes(item.id)))}
                disabled={!analysis.vocabulary.some((item) => !knownByWord.has(wordKey(item.word)))}
                className="flex-1"
              />
            </View>

            <View className="pt-5 border-t border-line gap-3">
              <View className="flex-row items-center gap-2">
                <Filter size={18} color={colors.ink} />
                <Text className="font-bold text-ink">Filters</Text>
              </View>
              <FilterChip
                label="Select all visible"
                checked={selectableVisible.length > 0 && selectableVisible.every((item) => selectedIds.includes(item.id))}
                onToggle={() =>
                  setSelectedIds((ids) => {
                    const allSelected = selectableVisible.length > 0 && selectableVisible.every((item) => ids.includes(item.id));
                    return allSelected ? ids.filter((id) => !selectableVisible.some((item) => item.id === id)) : [...new Set([...ids, ...selectableVisible.map((item) => item.id)])];
                  })
                }
              />
              <FilterChip label="Only unknown words" checked={onlyUnknown} onToggle={() => setOnlyUnknown((v) => !v)} />
              <FilterChip label="Only B2+" checked={onlyB2Plus} onToggle={() => setOnlyB2Plus((v) => !v)} />
              <FilterChip label="Only verbs" checked={partFilter === 'Verb'} onToggle={() => setPartFilter((v) => (v === 'Verb' ? 'all' : 'Verb'))} />
              <FilterChip label="Only nouns" checked={partFilter === 'Noun'} onToggle={() => setPartFilter((v) => (v === 'Noun' ? 'all' : 'Noun'))} />
              <FilterChip label="Only adjectives" checked={partFilter === 'Adjective'} onToggle={() => setPartFilter((v) => (v === 'Adjective' ? 'all' : 'Adjective'))} />
              <View className="gap-2 mt-2">
                <Text className="text-sm font-bold text-ink">Show vocabulary from level</Text>
                <Select
                  value={minimumLevel}
                  onChange={setMinimumLevel}
                  options={CEFR_LEVELS.map((level) => ({ value: level, label: level === nextCefrLevel(store.settings.learnerLevel) ? `${level} · recommended for you` : level }))}
                />
              </View>
            </View>
          </Card>

          {!!notice && (
            <Text className="text-sm font-medium" style={{ color: colors.success }}>
              {notice}
            </Text>
          )}

          <View className="gap-4">
            {visibleVocabulary.length ? (
              visibleVocabulary.map((item) => {
                const known = knownByWord.get(wordKey(item.word));
                return (
                  <YouTubeVocabularyCard
                    key={item.id}
                    item={item}
                    selected={selectedIds.includes(item.id)}
                    isKnown={Boolean(known)}
                    onSelectedChange={(checked) => setSelectedIds((ids) => (checked ? [...new Set([...ids, item.id])] : ids.filter((id) => id !== item.id)))}
                    onAdd={() => addItems([item])}
                    onIgnore={() => {
                      setIgnoredIds((ids) => [...ids, item.id]);
                      setSelectedIds((ids) => ids.filter((id) => id !== item.id));
                    }}
                    onReview={() => reviewAgain(item)}
                    onPlay={() => playPronunciation(item)}
                  />
                );
              })
            ) : (
              <Card className="p-8 items-center">
                <Text className="font-black text-xl text-ink">No words match these filters</Text>
                <Text className="text-muted mt-2 text-center">Try lowering the minimum level or changing the selection filters.</Text>
              </Card>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
