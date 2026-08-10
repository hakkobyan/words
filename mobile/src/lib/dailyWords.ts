import {BankWord,wordBank} from '@/data/wordBank';
import {CEFR_RANK} from '@/lib/youtube-vocabulary';
import {shuffle} from '@/lib/shuffle';
import {CefrLevel,StudyLanguage,UserWord} from '@/types';

export const DAILY_COUNT=10;

/**
 * Whether this launch's warm-up is already handled. Module state is enough on
 * native: killing the app tears the module down, which is exactly the reset we
 * want, so nothing needs to be persisted.
 */
let handled=false;
const listeners=new Set<()=>void>();
export const dailySession={
  subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener)}},
  isHandled(){return handled},
  markHandled(){handled=true;listeners.forEach(listener=>listener())},
};

/** Which way round a card is asked. `toRu`: show the foreign word, type the Russian. */
export type Direction='toRu'|'fromRu';
export interface DailyCard{entry:BankWord;direction:Direction}

/** Every Russian spelling accepted for an entry. */
export const russianAnswers=(entry:BankWord)=>[entry.translationRu,...(entry.alt||[])];

export function promptFor(card:DailyCard){return card.direction==='toRu'?card.entry.word:card.entry.translationRu}
export function answersFor(card:DailyCard){return card.direction==='toRu'?russianAnswers(card.entry):[card.entry.word]}

/**
 * Picks the next batch of unseen words at or above the learner's level, skipping
 * anything already in their dictionary. Once the pool runs dry the seen list is
 * ignored so the drill keeps working instead of coming up empty.
 */
export function pickDailyWords(language:StudyLanguage,level:CefrLevel,seenIds:string[],ownedWords:UserWord[]):DailyCard[]{
  const owned=new Set(ownedWords.filter(word=>word.language===language).map(word=>word.word.trim().toLowerCase()));
  const eligible=wordBank[language].filter(entry=>CEFR_RANK[entry.level]>=CEFR_RANK[level]&&!owned.has(entry.word.toLowerCase()));
  const seen=new Set(seenIds);
  const fresh=eligible.filter(entry=>!seen.has(entry.id));
  const pool=fresh.length>=DAILY_COUNT?fresh:eligible;
  return shuffle(pool).slice(0,DAILY_COUNT).map(entry=>({entry,direction:(Math.random()<0.5?'toRu':'fromRu') as Direction}));
}
