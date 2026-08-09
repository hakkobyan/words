import { Pressable, Text, View } from 'react-native';
import { Check, EyeOff, Plus, RotateCcw, Volume2 } from 'lucide-react-native';
import { VideoVocabularyItem } from '@/lib/youtube-vocabulary';
import { Card, Pill, Button } from '@/components/ui/Parts';
import { useThemeColors } from '@/lib/theme';

type Props = {
  item: VideoVocabularyItem;
  selected: boolean;
  isKnown: boolean;
  onSelectedChange: (selected: boolean) => void;
  onAdd: () => void;
  onIgnore: () => void;
  onReview: () => void;
  onPlay: () => void;
};

const timestamp = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function YouTubeVocabularyCard({ item, selected, isKnown, onSelectedChange, onAdd, onIgnore, onReview, onPlay }: Props) {
  const colors = useThemeColors();
  return (
    <Card className="p-5">
      <View className="flex-row items-start gap-3">
        <Pressable
          disabled={isKnown}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected, disabled: isKnown }}
          accessibilityLabel={`Select ${item.word}`}
          onPress={() => onSelectedChange(!selected)}
          className="pt-1.5 w-6 h-6 items-center justify-center"
        >
          <View
            className="w-5 h-5 rounded-[6px] items-center justify-center border"
            style={{ borderColor: colors.line, backgroundColor: selected ? colors.green : 'transparent', opacity: isKnown ? 0.5 : 1 }}
          >
            {selected && <Check size={14} color={colors.paper} />}
          </View>
        </Pressable>
        <View className="flex-1 min-w-0">
          <View className="flex-row flex-wrap items-start justify-between gap-3">
            <View>
              <View className="flex-row items-center flex-wrap gap-2">
                <Text className="text-2xl font-black text-ink">{item.word}</Text>
                <Pill>{item.level}</Pill>
                <Text className="text-muted text-sm">{item.partOfSpeech}</Text>
              </View>
              <Text className="text-muted mt-1">{item.pronunciation}</Text>
            </View>
            <Button variant="secondary" icon={<Volume2 size={18} color={colors.green} />} label="Play" onPress={onPlay} className="min-h-11 px-3" />
          </View>

          <View className="mt-5 gap-4">
            <View>
              <Text className="text-xs font-bold uppercase tracking-wider text-muted">Translation</Text>
              <Text className="font-bold text-lg text-ink mt-1">{item.translationRu}</Text>
            </View>
            <View>
              <Text className="text-xs font-bold uppercase tracking-wider text-muted">Simple explanation</Text>
              <Text className="text-ink mt-1">{item.explanation}</Text>
            </View>
          </View>

          <View className="rounded-2xl p-4 mt-5 bg-paper-2 border border-line">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xs font-bold uppercase tracking-wider text-muted">From the video</Text>
              <Text className="text-xs font-bold uppercase tracking-wider text-muted">{timestamp(item.timestampSeconds)}</Text>
            </View>
            <Text className="mt-2 font-medium text-ink">“{item.example}”</Text>
            {!!item.exampleTranslationRu && <Text className="text-muted text-sm mt-2">{item.exampleTranslationRu}</Text>}
          </View>

          <Text className="text-sm text-muted mt-4">
            <Text className="font-bold text-ink">Synonyms: </Text>
            {item.synonyms.join(', ')}
            {!!item.antonyms?.length && (
              <>
                {' · '}
                <Text className="font-bold text-ink">Antonyms: </Text>
                {item.antonyms.join(', ')}
              </>
            )}
          </Text>

          <View className="flex-row flex-wrap gap-3 mt-5 items-center">
            {isKnown ? (
              <Button variant="secondary" icon={<RotateCcw size={17} color={colors.green} />} label="Review again" onPress={onReview} />
            ) : (
              <Button variant="primary" icon={<Plus size={18} color={colors.onPrimary} />} label="Add" onPress={onAdd} />
            )}
            <Button variant="default" icon={<EyeOff size={18} color={colors.ink} />} label="Ignore" onPress={onIgnore} />
            {isKnown && (
              <View className="flex-row items-center gap-2 ml-auto">
                <Check size={18} color={colors.success} />
                <Text className="text-sm font-bold" style={{ color: colors.success }}>
                  Already learned
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}
