export type StudyLanguage='english'|'german';
export type Difficulty='new'|'learning'|'difficult'|'learned';
export interface UserWord{id:string;language:StudyLanguage;word:string;translationRu:string;categoryId:string;sessionId:string;example?:string;exampleTranslationRu?:string;note?:string;favorite:boolean;learned:boolean;correctAnswers:number;wrongAnswers:number;difficulty:Difficulty;lastReviewedAt?:string;nextReviewAt?:string;createdAt:string;updatedAt:string;demo?:boolean}
export interface Category{id:string;name:string;icon:string;isDefault:boolean;createdAt:string}
export interface VocabularySession{id:string;name:string;language:StudyLanguage;wordIds:string[];isActive:boolean;createdAt:string;updatedAt:string}
export interface Settings{theme:'light'|'dark'|'system';interfaceLanguage:'ru'|'en'|'de';defaultLanguage:StudyLanguage;cardsPerSession:number;showExamples:boolean;shuffle:boolean;reverse:boolean;autoCategory:boolean}
export interface DictionaryEntry{id:string;language:StudyLanguage;word:string;translationRu:string;categoryId:string;example?:string;exampleTranslationRu?:string}
