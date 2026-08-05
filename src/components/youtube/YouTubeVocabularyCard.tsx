'use client';

import {Check,EyeOff,Plus,RotateCcw,Volume2} from 'lucide-react';
import {VideoVocabularyItem} from '@/lib/youtube-vocabulary';

type Props={item:VideoVocabularyItem;selected:boolean;isKnown:boolean;onSelectedChange:(selected:boolean)=>void;onAdd:()=>void;onIgnore:()=>void;onReview:()=>void;onPlay:()=>void};

const timestamp=(seconds:number)=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;

export default function YouTubeVocabularyCard({item,selected,isKnown,onSelectedChange,onAdd,onIgnore,onReview,onPlay}:Props){
  return <article className="card p-5 md:p-6">
    <div className="flex items-start gap-3">
      <label className="pt-1.5" aria-label={`Select ${item.word}`}>
        <input type="checkbox" checked={selected} disabled={isKnown} onChange={event=>onSelectedChange(event.target.checked)}/>
      </label>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center flex-wrap gap-2"><h2 className="text-2xl font-black">{item.word}</h2><span className="pill">{item.level}</span><span className="muted text-sm">{item.partOfSpeech}</span></div>
            <p className="muted mt-1">{item.pronunciation}</p>
          </div>
          <button className="btn secondary min-h-11 px-3" onClick={onPlay} aria-label={`Play pronunciation for ${item.word}`}><Volume2 size={18}/><span className="hidden sm:inline">Play</span></button>
        </div>
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <div><p className="text-xs font-bold uppercase tracking-wider muted">Translation</p><p className="font-bold text-lg mt-1">{item.translationRu}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-wider muted">Simple explanation</p><p className="mt-1">{item.explanation}</p></div>
        </div>
        <div className="rounded-2xl p-4 mt-5" style={{background:'var(--paper-2)',border:'1px solid var(--line)'}}>
          <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider muted"><span>From the video</span><span>{timestamp(item.timestampSeconds)}</span></div>
          <p className="mt-2 font-medium">“{item.example}”</p>
          {item.exampleTranslationRu&&<p className="muted text-sm mt-2">{item.exampleTranslationRu}</p>}
        </div>
        <p className="text-sm muted mt-4"><b>Synonyms:</b> {item.synonyms.join(', ')}{item.antonyms?.length?<> <span aria-hidden="true">·</span> <b>Antonyms:</b> {item.antonyms.join(', ')}</>:null}</p>
        <div className="grid grid-cols-2 sm:flex gap-3 mt-5">
          {isKnown?<button className="btn secondary" onClick={onReview}><RotateCcw size={17}/>Review again</button>:<button className="btn primary" onClick={onAdd}><Plus size={18}/>Add</button>}
          <button className="btn justify-center" onClick={onIgnore}><EyeOff size={18}/>Ignore</button>
          {isKnown&&<span className="sm:ml-auto flex items-center gap-2 text-sm font-bold" style={{color:'var(--success)'}}><Check size={18}/>Already learned</span>}
        </div>
      </div>
    </div>
  </article>;
}
