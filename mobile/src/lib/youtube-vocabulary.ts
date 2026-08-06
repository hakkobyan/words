import {CEFR_LEVELS,CefrLevel} from '@/types';

// Client-side half of the YouTube feature: the shapes the API returns, plus the
// few pure helpers the screens need. Curation itself — and the word catalogues
// it matches transcripts against — lives in api/_lib, since only the server
// ever runs it and shipping it here would bundle it into the app for nothing.

export type VideoVocabularyItem={id:string;word:string;pronunciation:string;partOfSpeech:string;level:CefrLevel;translationRu:string;explanation:string;example:string;exampleTranslationRu:string;synonyms:string[];antonyms?:string[];categoryId:string;timestampSeconds:number};
export type VideoAnalysis={video:{id:string;title:string;url:string;durationSeconds:number;language:string;subtitleAvailability:'available'};vocabulary:VideoVocabularyItem[];transcriptWordCount:number};

export const CEFR_RANK:Record<CefrLevel,number>=Object.fromEntries(CEFR_LEVELS.map((level,index)=>[level,index])) as Record<CefrLevel,number>;

export function parseYoutubeUrl(value:string){
  try{
    const url=new URL(value.trim());
    const host=url.hostname.replace(/^www\./,'').toLowerCase();
    let id='';
    if(host==='youtu.be')id=url.pathname.split('/').filter(Boolean)[0]||'';
    if(host.endsWith('youtube.com'))id=url.searchParams.get('v')||url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1]||'';
    return /^[\w-]{11}$/.test(id)?{id,url:`https://www.youtube.com/watch?v=${id}`} : null;
  }catch{return null}
}

export function formatDuration(seconds:number){const minutes=Math.floor(seconds/60),remaining=seconds%60;return `${minutes}:${String(remaining).padStart(2,'0')}`}
export function nextCefrLevel(level:CefrLevel){return CEFR_LEVELS[Math.min(CEFR_RANK[level]+1,CEFR_LEVELS.length-1)]}
