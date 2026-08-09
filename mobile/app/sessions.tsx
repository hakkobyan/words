import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useVocabularyStore } from '@/store/useVocabularyStore';
import { Card, Button, Progress } from '@/components/ui/Parts';
import { useThemeColors } from '@/lib/theme';

export default function Sessions() {
  const s = useVocabularyStore();
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const lang = s.settings.defaultLanguage;

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerClassName="w-full max-w-[720px] self-center px-5 py-6 gap-5 pb-8">
      <Text className="text-muted">Наборы слов</Text>
      <Text className="text-3xl font-black text-ink -mt-2 mb-2">Сеансы</Text>
      <Card className="p-5 gap-3">
        <View className="flex-row gap-3">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Название сеанса"
            placeholderTextColor={colors.placeholder}
            className="flex-1 min-h-12 bg-card-strong border border-line rounded-2xl px-4 text-ink"
          />
        </View>
        <Button
          variant="primary"
          icon={<Plus size={18} color={colors.onPrimary} />}
          label="Создать"
          onPress={() => {
            s.addSession(name || `${lang === 'english' ? 'Английский' : 'Немецкий'} — ${new Date().toLocaleString('ru')}`, lang);
            setName('');
          }}
        />
      </Card>
      <View className="gap-4">
        {s.sessions.map((v) => {
          const ws = s.words.filter((w) => w.sessionId === v.id);
          const p = ws.length ? Math.round((ws.filter((w) => w.learned).length / ws.length) * 100) : 0;
          return (
            <Card key={v.id} className="p-5">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">{v.language === 'english' ? '🇬🇧' : '🇩🇪'}</Text>
                <View className="flex-1">
                  <Text className="font-bold text-ink">{v.name}</Text>
                  <Text className="text-muted text-sm">
                    {ws.length} слов · {new Date(v.createdAt).toLocaleDateString('ru')}
                  </Text>
                </View>
                <Pressable accessibilityLabel="Удалить" onPress={() => s.deleteSession(v.id)} className="min-w-11 min-h-11 items-center justify-center">
                  <Trash2 size={18} color={colors.danger} />
                </Pressable>
              </View>
              <View className="mt-4">
                <Progress value={p} />
              </View>
              <View className="flex-row gap-2 mt-4">
                <Button variant="secondary" label="Продолжить" onPress={() => router.push({ pathname: '/add', params: { session: v.id } })} className="flex-1" />
                <Button variant="primary" label="Учить" onPress={() => router.push({ pathname: '/study/flashcards', params: { session: v.id } })} className="flex-1" />
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}
