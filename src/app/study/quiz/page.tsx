'use client';import {useEffect,useState} from 'react';import Link from 'next/link';import {useVocabularyStore} from '@/store/useVocabularyStore';import {Progress} from '@/components/ui/Parts';import {shuffle} from '@/lib/shuffle';import {UserWord} from '@/types';
type Question={word:UserWord;options:UserWord[]};
export default function Quiz(){
  const s=useVocabularyStore();
  const [deck,setDeck]=useState<Question[]>([]),[ready,setReady]=useState(false);
  const [i,setI]=useState(0),[score,setScore]=useState(0),[picked,setPicked]=useState('');
  useEffect(()=>{
    if(!s.isHydrated)return;
    const pool=useVocabularyStore.getState().words.filter(w=>w.language===s.settings.defaultLanguage);
    if(pool.length>=4){
      const questionWords=(s.settings.shuffle?shuffle(pool):pool).slice(0,10);
      setDeck(questionWords.map(word=>({word,options:shuffle([word,...shuffle(pool.filter(w=>w.id!==word.id)).slice(0,3)])})));
    }else setDeck([]);
    setI(0);setScore(0);setPicked('');setReady(true);
  },[s.isHydrated,s.settings.defaultLanguage,s.settings.shuffle]);
  if(!ready)return null;
  if(s.words.filter(w=>w.language===s.settings.defaultLanguage).length<4)return <div className="card p-10 text-center"><h1 className="text-2xl font-bold">Нужно минимум 4 слова</h1><p className="muted my-4">Добавьте ещё слов выбранного языка, чтобы варианты ответов были корректными.</p><Link className="btn primary" href="/add">Добавить слова</Link></div>;
  if(i>=deck.length)return <div className="card p-8 text-center"><h1 className="text-3xl font-black">Результат: {score} из {deck.length}</h1><p className="muted my-5">Точность {Math.round(score/deck.length*100)}%</p><Link href="/" className="btn primary">На главную</Link></div>;
  const {word:q,options}=deck[i];
  return <div className="max-w-xl mx-auto"><p className="muted text-sm mb-2">Вопрос {i+1} из {deck.length}</p><Progress value={i/deck.length*100}/><div className="card p-7 mt-6 text-center"><span className="pill">{q.language==='english'?'EN':'DE'}</span><h1 className="text-4xl font-black my-8">{q.word}</h1><div className="grid gap-3">{options.map(o=><button key={o.id} disabled={!!picked} onClick={()=>{setPicked(o.id);if(o.id===q.id)setScore(x=>x+1)}} className={`btn border ${picked?(o.id===q.id?'answer-correct':picked===o.id?'answer-wrong':''):''}`}>{o.translationRu}</button>)}</div>{picked&&<button className="btn primary w-full mt-5" onClick={()=>{setI(x=>x+1);setPicked('')}}>Продолжить</button>}</div></div>;
}
