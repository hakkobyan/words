import { ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { Card, Button, Pill, Progress } from '@/components/ui/Parts';

export default function Category() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const s = useVocabularyStore();
  const c = s.categories.find((x) => x.id === categoryId);
  const ws = s.words.filter((w) => w.categoryId === categoryId);
  const p = ws.length ? Math.round((ws.filter((w) => w.learned).length / ws.length) * 100) : 0;

  if (!c) return <View className="flex-1 bg-paper p-4"><Text className="text-ink">Категория не найдена</Text></View>;

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerClassName="p-4 gap-4 pb-8">
      <Card className="p-6">
        <Text className="text-4xl">{c.icon}</Text>
        <Text className="text-3xl font-black text-ink mt-3">{c.name}</Text>
        <Text className="text-muted mb-4">
          {ws.length} слов · изучено {p}%
        </Text>
        <Progress value={p} />
        <View className="flex-row gap-3 mt-5">
          <Button
            variant="primary"
            label="Учить категорию"
            onPress={() => router.push({ pathname: '/study/flashcards', params: { category: c.id } })}
          />
          <Button
            variant="secondary"
            label="Добавить слово"
            onPress={() => router.push({ pathname: '/add', params: { category: c.id } })}
          />
        </View>
      </Card>
      <View className="gap-3">
        {ws.map((w) => (
          <Card key={w.id} className="p-4 flex-row items-center gap-3">
            <Pill>{w.language === 'english' ? 'EN' : 'DE'}</Pill>
            <Text className="flex-1 font-bold text-ink">
              {w.word} <Text className="text-muted font-normal">— {w.translationRu}</Text>
            </Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
