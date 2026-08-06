import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Heart, Trash2 } from 'lucide-react-native';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { Card, Empty, Pill, Select, SearchBox } from '@/components/ui/Parts';
import { categoryLabel, useI18n } from '@/lib/i18n';
import { useThemeColors } from '@/lib/theme';

type LangFilter = 'all' | 'english' | 'german';
type SortOrder = 'new' | 'old' | 'alpha' | 'mistakes';

export default function Words() {
  const s = useVocabularyStore();
  const { pick, locale } = useI18n();
  const colors = useThemeColors();
  const [q, setQ] = useState('');
  const [lang, setLang] = useState<LangFilter>('all');
  const [sort, setSort] = useState<SortOrder>('new');

  let ws = s.words.filter(
    (w) => (lang === 'all' || w.language === lang) && `${w.word} ${w.translationRu}`.toLocaleLowerCase().includes(q.toLocaleLowerCase())
  );
  ws = [...ws].sort((a, b) =>
    sort === 'alpha'
      ? a.word.localeCompare(b.word)
      : sort === 'mistakes'
        ? b.wrongAnswers - a.wrongAnswers
        : sort === 'old'
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt)
  );

  return (
    <View className="flex-1 bg-paper">
      <FlatList
        data={ws}
        keyExtractor={(w) => w.id}
        contentContainerClassName="p-4 gap-3 pb-8"
        ListHeaderComponent={
          <View className="gap-3 mb-3">
            <View>
              <Text className="text-muted">{pick('Ваша коллекция', 'Your collection')}</Text>
              <Text className="text-3xl font-black text-ink">
                {pick('Все слова', 'All words')} <Text className="text-muted">{ws.length}</Text>
              </Text>
            </View>
            <SearchBox value={q} onChange={setQ} />
            <Select
              value={lang}
              onChange={setLang}
              options={[
                { value: 'all', label: pick('Все языки', 'All languages') },
                { value: 'english', label: `EN · ${pick('Английский', 'English')}` },
                { value: 'german', label: `DE · ${pick('Немецкий', 'German')}` },
              ]}
            />
            <Select
              value={sort}
              onChange={setSort}
              options={[
                { value: 'new', label: pick('Сначала новые', 'Newest first') },
                { value: 'old', label: pick('Сначала старые', 'Oldest first') },
                { value: 'alpha', label: pick('По алфавиту', 'Alphabetical') },
                { value: 'mistakes', label: pick('По ошибкам', 'Most mistakes') },
              ]}
            />
          </View>
        }
        ListEmptyComponent={
          <Empty
            title={pick('Слов не найдено', 'No words found')}
            text={pick('Измените фильтры или добавьте новое слово', 'Change the filters or add a new word')}
          />
        }
        renderItem={({ item: w }) => {
          const c = s.categories.find((c) => c.id === w.categoryId);
          return (
            <Card className="p-4 flex-row gap-4 items-center">
              <Pill>{w.language === 'english' ? 'EN' : 'DE'}</Pill>
              <View className="flex-1 min-w-0">
                <Text className="font-bold text-lg text-ink" numberOfLines={1}>
                  {w.word} <Text className="font-normal text-muted">— {w.translationRu}</Text>
                </Text>
                <Text className="text-muted text-xs">
                  {c ? categoryLabel(c.id, c.name, locale) : ''} · {w.learned ? pick('Изучено', 'Learned') : pick('В процессе', 'Learning')} ·{' '}
                  {w.wrongAnswers} {pick('ошибок', 'mistakes')}
                </Text>
              </View>
              <Pressable accessibilityLabel={pick('В избранное', 'Favorite')} onPress={() => s.updateWord(w.id, { favorite: !w.favorite })} className="p-2">
                <Heart size={19} fill={w.favorite ? '#f2a65a' : 'none'} color={w.favorite ? '#f2a65a' : colors.ink} />
              </Pressable>
              <Pressable accessibilityLabel={pick('Удалить', 'Delete')} onPress={() => s.deleteWord(w.id)} className="p-2 min-w-11 min-h-11 items-center justify-center">
                <Trash2 size={19} color={colors.danger} />
              </Pressable>
            </Card>
          );
        }}
      />
    </View>
  );
}
