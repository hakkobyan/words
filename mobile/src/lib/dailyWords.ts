import {BankWord,wordBank} from '@/data/wordBank';
import {NOUN_HUNT_TARGETS} from '@/data/wordHunt';
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

export interface DailyEntry extends BankWord{cloze?:string}

/** Translation cards work both ways; imported Word Hunt nouns use a source sentence. */
export type Direction='toRu'|'fromRu'|'cloze';
export interface DailyCard{entry:DailyEntry;direction:Direction}

/** Every Russian spelling accepted for an entry. */
export const russianAnswers=(entry:BankWord)=>[entry.translationRu,...(entry.alt||[])];

export function promptFor(card:DailyCard){
  if(card.direction==='cloze')return card.entry.cloze??card.entry.word;
  return card.direction==='toRu'?card.entry.word:card.entry.translationRu;
}
export function answersFor(card:DailyCard){return card.direction==='toRu'?russianAnswers(card.entry):[card.entry.word]}

/**
 * Picks the next batch of unseen words from the learner's exact level, skipping
 * anything already in their dictionary when the remaining pool is large enough.
 * Once a pool runs dry, earlier or owned words from the same level can return so
 * the drill keeps offering ten cards without mixing CEFR levels.
 */
export function pickDailyWords(language:StudyLanguage,level:CefrLevel,seenIds:string[],ownedWords:UserWord[]):DailyCard[]{
  const owned=new Set(ownedWords.filter(word=>word.language===language).map(word=>word.word.trim().toLowerCase()));
  const bank:DailyEntry[]=language==='english'
    ?NOUN_HUNT_TARGETS.map(target=>({id:`english:${target.id}`,word:target.word,translationRu:target.translationRu,level:target.level,categoryId:target.categoryId,cloze:target.cloze}))
    :wordBank[language];
  const levelWords=bank.filter(entry=>entry.level===level);
  const unowned=levelWords.filter(entry=>!owned.has(entry.word.toLowerCase()));
  const eligible=unowned.length>=DAILY_COUNT?unowned:levelWords;
  const seen=new Set(seenIds);
  const fresh=eligible.filter(entry=>!seen.has(entry.id));
  const pool=fresh.length>=DAILY_COUNT?fresh:eligible;
  return shuffle(pool).slice(0,DAILY_COUNT).map(entry=>{
    const hasRussianTranslation=entry.translationRu.trim().toLowerCase()!==entry.word.trim().toLowerCase();
    const direction:Direction=!hasRussianTranslation&&entry.cloze?'cloze':Math.random()<0.5?'toRu':'fromRu';
    return {entry,direction};
  });
}
