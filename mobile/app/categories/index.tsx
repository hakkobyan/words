import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { Card, Button, Progress } from '@/components/ui/Parts';
import { useThemeColors } from '@/lib/theme';

export default function Categories() {
  const s = useVocabularyStore();
  const colors = useThemeColors();
  const [name, setName] = useState('');

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerClassName="w-full max-w-[720px] self-center px-4 py-5 gap-4 pb-8">
      <Text className="text-muted">Тематические подборки</Text>
      <Text className="text-3xl font-black text-ink -mt-2 mb-2">Категории</Text>
      <Card className="p-4 gap-3">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Название новой категории"
          placeholderTextColor={colors.placeholder}
          className="min-h-12 bg-card-strong border border-line rounded-2xl px-4 text-ink"
        />
        <Button
          variant="primary"
          icon={<Plus size={18} color={colors.onPrimary} />}
          label="Создать"
          onPress={() => {
            if (name.trim()) {
              s.addCategory(name.trim(), '✨');
              setName('');
            }
          }}
        />
      </Card>
      <View className="flex-row flex-wrap gap-3">
        {s.categories.map((c) => {
          const ws = s.words.filter((w) => w.categoryId === c.id);
          const p = ws.length ? Math.round((ws.filter((w) => w.learned).length / ws.length) * 100) : 0;
          return (
            <View key={c.id} style={{ width: '47%' }}>
              <Pressable onPress={() => router.push(`/categories/${c.id}`)}>
                <Card className="p-5">
                  <Text className="text-3xl">{c.icon}</Text>
                  <Text className="font-bold text-lg text-ink mt-3">{c.name}</Text>
                  <Text className="text-muted text-sm mb-3">
                    {ws.length} слов · EN {ws.filter((w) => w.language === 'english').length} · DE {ws.filter((w) => w.language === 'german').length}
                  </Text>
                  <Progress value={p} />
                </Card>
              </Pressable>
              {!c.isDefault && (
                <Pressable
                  onPress={() => s.deleteCategory(c.id)}
                  className="absolute top-2 right-2 min-w-11 min-h-11 items-center justify-center"
                >
                  <Trash2 size={17} color={colors.danger} />
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
