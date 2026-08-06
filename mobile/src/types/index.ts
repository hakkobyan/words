export type StudyLanguage='english'|'german';
export const CEFR_LEVELS=['A1','A2','B1','B2','C1','C2'] as const;
export type CefrLevel=(typeof CEFR_LEVELS)[number];
export type Difficulty='new'|'learning'|'difficult'|'learned';
export type WordSource='manual'|'youtube';
export interface UserWord{id:string;language:StudyLanguage;word:string;translationRu:string;categoryId:string;sessionId:string;example?:string;exampleTranslationRu?:string;note?:string;pronunciation?:string;partOfSpeech?:string;cefrLevel?:CefrLevel;explanation?:string;synonyms?:string[];antonyms?:string[];source?:WordSource;sourceVideoTitle?:string;sourceVideoUrl?:string;sourceTimestampSeconds?:number;favorite:boolean;learned:boolean;correctAnswers:number;wrongAnswers:number;difficulty:Difficulty;lastReviewedAt?:string;nextReviewAt?:string;createdAt:string;updatedAt:string}
export interface Category{id:string;name:string;icon:string;isDefault:boolean;createdAt:string}
export interface VocabularySession{id:string;name:string;language:StudyLanguage;wordIds:string[];isActive:boolean;createdAt:string;updatedAt:string}
export interface Settings{theme:'light'|'dark'|'system';interfaceLanguage:'ru'|'en'|'de';defaultLanguage:StudyLanguage;learnerLevel:CefrLevel;cardsPerSession:number;showExamples:boolean;shuffle:boolean;reverse:boolean;autoCategory:boolean;onboardingCompleted:boolean}
