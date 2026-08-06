'use client';

import {create} from 'zustand';
import {categories as defaults} from '@/data/defaults';
import {read,write} from '@/lib/storage';
import {Category,Settings,StudyLanguage,UserWord,VocabularySession} from '@/types';

const baseSettings:Settings={theme:'system',interfaceLanguage:'ru',defaultLanguage:'english',learnerLevel:'B1',cardsPerSession:10,showExamples:true,shuffle:true,reverse:true,autoCategory:true,onboardingCompleted:false};
type NewWord=Omit<UserWord,'id'|'createdAt'|'updatedAt'>;
type Store={
  words:UserWord[];categories:Category[];sessions:VocabularySession[];settings:Settings;selectedStudyLanguage:StudyLanguage;isHydrated:boolean;
  hydrate:()=>void;addWord:(word:NewWord)=>void;addWords:(words:NewWord[])=>void;updateWord:(id:string,patch:Partial<UserWord>)=>void;deleteWord:(id:string)=>void;
  addCategory:(name:string,icon:string)=>void;deleteCategory:(id:string,withWords?:boolean)=>void;addSession:(name:string,language:StudyLanguage)=>string;updateSession:(id:string,patch:Partial<VocabularySession>)=>void;deleteSession:(id:string)=>void;
  setLanguage:(language:StudyLanguage)=>void;setSettings:(patch:Partial<Settings>)=>void;replaceData:(data:{words:UserWord[];categories:Category[];sessions:VocabularySession[];settings?:Settings})=>void;resetProgress:()=>void;clear:()=>void;
};
const persist=(state:{words:UserWord[];categories:Category[];sessions:VocabularySession[];settings:Settings})=>{write('words',state.words);write('categories',state.categories);write('sessions',state.sessions);write('settings',state.settings)};

export const useVocabularyStore=create<Store>((set,get)=>({
  words:[],categories:defaults,sessions:[],settings:baseSettings,selectedStudyLanguage:'english',isHydrated:false,
  hydrate:()=>{
    if(get().isHydrated)return;
    let sessions=read<VocabularySession[]>('sessions',[]);
    let words=read<UserWord[]>('words',[]);
    if(!read('meta',false))write('meta',true);
    words=words.filter(word=>!word.demo);
    sessions=sessions.filter(session=>!session.id.startsWith('demo-'));
    const state={words,categories:read('categories',defaults),sessions,settings:{...baseSettings,...read<Partial<Settings>>('settings',{})},isHydrated:true};
    set(state);
    persist(state);
  },
  addWord:word=>{
    const now=new Date().toISOString(),created={...word,id:crypto.randomUUID(),createdAt:now,updatedAt:now};
    set(state=>{
      const next={words:[created,...state.words],sessions:state.sessions.map(session=>session.id===created.sessionId?{...session,wordIds:[...session.wordIds,created.id],updatedAt:now}:session)};
      persist({...state,...next});
      return next;
    });
  },
  addWords:words=>{
    if(!words.length)return;
    const now=new Date().toISOString(),created=words.map(word=>({...word,id:crypto.randomUUID(),createdAt:now,updatedAt:now}));
    set(state=>{
      const idsBySession=new Map<string,string[]>();
      created.forEach(word=>idsBySession.set(word.sessionId,[...(idsBySession.get(word.sessionId)||[]),word.id]));
      const next={words:[...created,...state.words],sessions:state.sessions.map(session=>{const wordIds=idsBySession.get(session.id);return wordIds?{...session,wordIds:[...session.wordIds,...wordIds],updatedAt:now}:session})};
      persist({...state,...next});
      return next;
    });
  },
  updateWord:(id,patch)=>set(state=>{const next={words:state.words.map(word=>word.id===id?{...word,...patch,updatedAt:new Date().toISOString()}:word)};persist({...state,...next});return next}),
  deleteWord:id=>set(state=>{const next={words:state.words.filter(word=>word.id!==id),sessions:state.sessions.map(session=>({...session,wordIds:session.wordIds.filter(wordId=>wordId!==id)}))};persist({...state,...next});return next}),
  addCategory:(name,icon)=>set(state=>{const next={categories:[...state.categories,{id:crypto.randomUUID(),name,icon,isDefault:false,createdAt:new Date().toISOString()}]};persist({...state,...next});return next}),
  deleteCategory:(id,withWords)=>set(state=>{const next={categories:state.categories.filter(category=>category.id!==id),words:withWords?state.words.filter(word=>word.categoryId!==id):state.words.map(word=>word.categoryId===id?{...word,categoryId:'other'}:word)};persist({...state,...next});return next}),
  addSession:(name,language)=>{
    const id=crypto.randomUUID(),now=new Date().toISOString();
    set(state=>{const next={sessions:[{id,name,language,wordIds:[],isActive:true,createdAt:now,updatedAt:now},...state.sessions.map(session=>({...session,isActive:false}))]};persist({...state,...next});return next});
    return id;
  },
  updateSession:(id,patch)=>set(state=>{const next={sessions:state.sessions.map(session=>session.id===id?{...session,...patch,updatedAt:new Date().toISOString()}:session)};persist({...state,...next});return next}),
  deleteSession:id=>set(state=>{const next={sessions:state.sessions.filter(session=>session.id!==id),words:state.words.filter(word=>word.sessionId!==id)};persist({...state,...next});return next}),
  setLanguage:language=>set({selectedStudyLanguage:language}),
  setSettings:patch=>set(state=>{const next={settings:{...state.settings,...patch}};persist({...state,...next});return next}),
  replaceData:data=>set(state=>{const next={...data,settings:{...baseSettings,...(data.settings||state.settings)}};persist(next);return next}),
  resetProgress:()=>set(state=>{const next={words:state.words.map(word=>({...word,learned:false,difficulty:'new' as const,correctAnswers:0,wrongAnswers:0,nextReviewAt:undefined,lastReviewedAt:undefined}))};persist({...state,...next});return next}),
  clear:()=>{const next={words:[],sessions:[],categories:defaults,settings:baseSettings};persist(next);set(next);},
}));
