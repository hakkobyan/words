import { A1_VOCABULARY_ROWS } from "@/data/cefrVocabulary.a1";
import { A2_VOCABULARY_ROWS } from "@/data/cefrVocabulary.a2";
import { B1_VOCABULARY_ROWS } from "@/data/cefrVocabulary.b1";
import { B2_VOCABULARY_ROWS } from "@/data/cefrVocabulary.b2";
import { C1_VOCABULARY_ROWS } from "@/data/cefrVocabulary.c1";
import { C2_VOCABULARY_ROWS } from "@/data/cefrVocabulary.c2";
import { CefrLevel } from "@/types";

export type VocabularyPartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "other";
export interface CefrVocabularyEntry {
  id: string;
  word: string;
  translationRu: string;
  level: CefrLevel;
  categoryId: string;
  partOfSpeech: VocabularyPartOfSpeech;
}

type RawPartOfSpeech = "n" | "v" | "a" | "r" | "o";
type RawVocabularyRow = readonly [
  word: string,
  translationRu: string,
  partOfSpeech: RawPartOfSpeech,
];

const PARTS: Record<RawPartOfSpeech, VocabularyPartOfSpeech> = {
  n: "noun",
  v: "verb",
  a: "adjective",
  r: "adverb",
  o: "other",
};
const CATEGORY: Record<RawPartOfSpeech, string> = {
  n: "other",
  v: "verbs",
  a: "adjectives",
  r: "other",
  o: "other",
};

const build = (
  level: CefrLevel,
  rows: readonly RawVocabularyRow[],
): CefrVocabularyEntry[] =>
  rows.map(([word, translationRu, partOfSpeech]) => ({
    id: `english:${word}`,
    word,
    translationRu,
    level,
    categoryId: CATEGORY[partOfSpeech],
    partOfSpeech: PARTS[partOfSpeech],
  }));

export const CEFR_VOCABULARY_BY_LEVEL: Record<
  CefrLevel,
  CefrVocabularyEntry[]
> = {
  A1: build("A1", A1_VOCABULARY_ROWS),
  A2: build("A2", A2_VOCABULARY_ROWS),
  B1: build("B1", B1_VOCABULARY_ROWS),
  B2: build("B2", B2_VOCABULARY_ROWS),
  C1: build("C1", C1_VOCABULARY_ROWS),
  C2: build("C2", C2_VOCABULARY_ROWS),
};

export const CEFR_VOCABULARY = (
  Object.keys(CEFR_VOCABULARY_BY_LEVEL) as CefrLevel[]
).flatMap((level) => CEFR_VOCABULARY_BY_LEVEL[level]);
