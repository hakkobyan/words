'use client';

import {FormEvent,useEffect,useMemo,useState} from 'react';
import {Captions,Check,ChevronDown,Clock3,ExternalLink,Filter,Languages,LoaderCircle,Play,Plus,RefreshCw,Sparkles,Video} from 'lucide-react';
import YouTubeVocabularyCard from '@/components/youtube/YouTubeVocabularyCard';
import {CEFR_RANK,formatDuration,nextCefrLevel,parseYoutubeUrl,VideoAnalysis,VideoVocabularyItem} from '@/lib/youtube-vocabulary';
import {CEFR_LEVELS,CefrLevel} from '@/types';
import {useVocabularyStore} from '@/store/useVocabularyStore';

const loadingSteps=['Downloading subtitles…','Detecting language…','Finding useful vocabulary…','Translating words…','Preparing lesson…'];
const errors:Record<string,{title:string;text:string}>={
  INVALID_URL:{title:'Enter a valid YouTube link',text:'Paste a public YouTube watch, short, live, or share URL and try again.'},
  PRIVATE_VIDEO:{title:'This video is not available',text:'It may be private, deleted, or unavailable in your region.'},
  VIDEO_UNAVAILABLE:{title:'This video is not available',text:'It may be private, deleted, or unavailable in your region.'},
  NO_SUBTITLES:{title:'No subtitles were found for this video',text:'Try another video with captions in your learning language.'},
  CAPTION_FETCH_BLOCKED:{title:'YouTube blocked this request',text:'YouTube is rate-limiting caption requests from this server (common on cloud hosting like Vercel). This usually resolves on retry after a short wait, or may require a proxy for the server. It is not an issue with this specific video.'},
  UNSUPPORTED_LANGUAGE:{title:'This subtitle language is unsupported',text:'Choose English or German, then try a video with matching captions.'},
  NO_USEFUL_VOCABULARY:{title:'No useful vocabulary was found',text:'The captions contain no curated terms at this level. Try a longer or more detailed video.'},
  TIMEOUT:{title:'The request took too long',text:'YouTube did not respond in time. Please try again.'},
  NETWORK_ERROR:{title:'Could not reach YouTube',text:'Check your connection and try again.'},
};
type PartFilter='all'|'Verb'|'Noun'|'Adjective';

const wordKey=(word:string)=>word.trim().toLocaleLowerCase();

export default function YouTubeVocabulary(){
  const store=useVocabularyStore();
  const [url,setUrl]=useState('');
  const [analysis,setAnalysis]=useState<VideoAnalysis|null>(null);
  const [state,setState]=useState<'idle'|'loading'|'results'|'error'>('idle');
  const [errorCode,setErrorCode]=useState('');
  const [loadingStep,setLoadingStep]=useState(0);
  const [minimumLevel,setMinimumLevel]=useState<CefrLevel>(nextCefrLevel(store.settings.learnerLevel));
  const [onlyUnknown,setOnlyUnknown]=useState(true);
  const [onlyB2Plus,setOnlyB2Plus]=useState(false);
  const [partFilter,setPartFilter]=useState<PartFilter>('all');
  const [selectedIds,setSelectedIds]=useState<string[]>([]);
  const [ignoredIds,setIgnoredIds]=useState<string[]>([]);
  const [videoSessionId,setVideoSessionId]=useState('');
  const [notice,setNotice]=useState('');
  const language=store.settings.defaultLanguage;
  const knownByWord=useMemo(()=>new Map(store.words.filter(word=>word.language===language).map(word=>[wordKey(word.word),word])),[store.words,language]);

  useEffect(()=>{
    if(state!=='loading')return;
    setLoadingStep(0);
    const timer=window.setInterval(()=>setLoadingStep(step=>(step+1)%loadingSteps.length),900);
    return()=>window.clearInterval(timer);
  },[state]);

  useEffect(()=>setMinimumLevel(nextCefrLevel(store.settings.learnerLevel)),[store.settings.learnerLevel]);

  const visibleVocabulary=useMemo(()=>{
    if(!analysis)return [];
    const cutoff=Math.max(CEFR_RANK[minimumLevel],onlyB2Plus?CEFR_RANK.B2:0);
    return analysis.vocabulary.filter(item=>!ignoredIds.includes(item.id)&&CEFR_RANK[item.level]>=cutoff&&(!onlyUnknown||!knownByWord.has(wordKey(item.word)))&&(partFilter==='all'||item.partOfSpeech===partFilter));
  },[analysis,ignoredIds,knownByWord,minimumLevel,onlyB2Plus,onlyUnknown,partFilter]);
  const selectableVisible=visibleVocabulary.filter(item=>!knownByWord.has(wordKey(item.word)));
  const selectedItems=(analysis?.vocabulary||[]).filter(item=>selectedIds.includes(item.id)&&!knownByWord.has(wordKey(item.word))&&!ignoredIds.includes(item.id));
  const allVisibleSelected=selectableVisible.length>0&&selectableVisible.every(item=>selectedIds.includes(item.id));
  const knownCount=analysis?.vocabulary.filter(item=>knownByWord.has(wordKey(item.word))).length||0;

  async function analyze(event:FormEvent){
    event.preventDefault();
    if(!parseYoutubeUrl(url)){setErrorCode('INVALID_URL');setState('error');return}
    setState('loading');setErrorCode('');setNotice('');setAnalysis(null);setSelectedIds([]);setIgnoredIds([]);setVideoSessionId('');
    try{
      const response=await fetch('/api/youtube-vocabulary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url,language})});
      const data=await response.json() as VideoAnalysis&{error?:string};
      if(!response.ok)throw new Error(data.error||'NETWORK_ERROR');
      setAnalysis(data);
      setSelectedIds(data.vocabulary.filter(item=>!knownByWord.has(wordKey(item.word))).map(item=>item.id));
      setState('results');
    }catch(error){setErrorCode(error instanceof Error?error.message:'NETWORK_ERROR');setState('error')}
  }

  function addItems(items:VideoVocabularyItem[]){
    if(!analysis)return;
    const newItems=items.filter(item=>!knownByWord.has(wordKey(item.word)));
    if(!newItems.length){setNotice('These words are already in your dictionary.');return}
    const sessionId=videoSessionId||store.addSession(`YouTube · ${analysis.video.title}`,language);
    setVideoSessionId(sessionId);
    store.addWords(newItems.map(item=>({language,word:item.word,translationRu:item.translationRu,categoryId:store.settings.autoCategory?item.categoryId:'other',sessionId,example:item.example,exampleTranslationRu:item.exampleTranslationRu,pronunciation:item.pronunciation,partOfSpeech:item.partOfSpeech,cefrLevel:item.level,explanation:item.explanation,synonyms:item.synonyms,antonyms:item.antonyms,source:'youtube',sourceVideoTitle:analysis.video.title,sourceVideoUrl:analysis.video.url,sourceTimestampSeconds:item.timestampSeconds,favorite:false,learned:false,correctAnswers:0,wrongAnswers:0,difficulty:'new'})));
    setSelectedIds(ids=>ids.filter(id=>!newItems.some(item=>item.id===id)));
    setNotice(`${newItems.length} ${newItems.length===1?'word was':'words were'} added to your dictionary.`);
  }

  function playPronunciation(item:VideoVocabularyItem){
    if(!('speechSynthesis' in window))return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(item.word);
    utterance.lang=language==='english'?'en-US':'de-DE';
    window.speechSynthesis.speak(utterance);
  }

  function reviewAgain(item:VideoVocabularyItem){
    const known=knownByWord.get(wordKey(item.word));
    if(!known)return;
    store.updateWord(known.id,{learned:false,nextReviewAt:new Date().toISOString()});
    setNotice(`${item.word} is ready to review again.`);
  }

  const activeError=errors[errorCode]||errors.NETWORK_ERROR;
  return <div className="space-y-7 pb-6">
    <header className="max-w-3xl">
      <p className="muted text-sm mb-1">Learn from real content</p>
      <h1 className="text-3xl md:text-5xl font-black tracking-tight">YouTube Vocabulary</h1>
      <p className="muted mt-3 text-lg">Paste any YouTube video link and automatically generate a vocabulary list from its subtitles.</p>
    </header>

    <form onSubmit={analyze} className="card p-5 md:p-7">
      <div className="grid lg:grid-cols-[1fr_auto] gap-4 items-end">
        <label className="block"><span className="font-bold">Paste YouTube URL</span><div className="relative mt-2"><Video size={20} className="absolute left-4 top-3.5 muted"/><input className="pl-11" type="url" value={url} onChange={event=>setUrl(event.target.value)} placeholder="https://youtube.com/watch?v=…" autoComplete="url" inputMode="url" disabled={state==='loading'} required/></div></label>
        <button className="btn primary min-w-44 sticky bottom-24 md:static" disabled={state==='loading'} type="submit">{state==='loading'?<LoaderCircle className="animate-spin" size={20}/>:<Sparkles size={20}/>} {state==='loading'?'Analyzing…':'Analyze video'}</button>
      </div>
      <div className="flex items-center gap-2 text-sm muted mt-4"><Languages size={16}/><span>Captions are analyzed in {language==='english'?'English':'German'}.</span></div>
    </form>

    {state==='loading'&&<section className="card hero p-6 md:p-8 overflow-hidden" role="status" aria-live="polite"><div className="flex items-start gap-4"><div className="hero-action rounded-2xl p-3"><LoaderCircle className="animate-spin" size={25}/></div><div className="flex-1"><p className="text-sm font-bold tracking-wider uppercase opacity-80">Analyzing video</p><h2 className="text-2xl font-black mt-1">{loadingSteps[loadingStep]}</h2><p className="mt-2 opacity-85">We are curating useful terms, not simply listing every word.</p><div className="mt-6 grid sm:grid-cols-5 gap-2">{loadingSteps.map((step,index)=><div key={step} className="rounded-xl px-3 py-2 text-xs font-bold" style={{background:index<=loadingStep?'rgba(255,250,243,.24)':'rgba(255,250,243,.10)'}}>{index<loadingStep?<Check size={15} className="inline mr-1"/>:null}{step.replace('…','')}</div>)}</div></div></div></section>}

    {state==='error'&&<section className="card p-7 text-center max-w-2xl mx-auto"><span className="secondary inline-flex p-4 rounded-2xl"><Captions size={28}/></span><h2 className="text-xl font-black mt-4">{activeError.title}</h2><p className="muted mt-2">{activeError.text}</p><button className="btn primary mt-5" onClick={()=>{setState('idle');setErrorCode('')}}><RefreshCw size={18}/>Try another video</button></section>}

    {state==='results'&&analysis&&<>
      <section className="card overflow-hidden"><div className="p-5 md:p-7 flex flex-col lg:flex-row gap-5 lg:items-center"><div className="secondary rounded-2xl p-4 w-fit"><Video size={27}/></div><div className="flex-1 min-w-0"><p className="muted text-sm">Video analyzed</p><a className="font-black text-xl hover:underline inline-flex items-center gap-2" href={analysis.video.url} target="_blank" rel="noreferrer">{analysis.video.title}<ExternalLink size={17}/></a><p className="muted text-sm mt-1">{analysis.transcriptWordCount.toLocaleString()} subtitle words processed</p></div><a className="btn secondary" href={analysis.video.url} target="_blank" rel="noreferrer"><Play size={18}/>Open video</a></div><div className="grid grid-cols-2 md:grid-cols-4 border-t" style={{borderColor:'var(--line)'}}>{[[Clock3,formatDuration(analysis.video.durationSeconds)||'—','Duration'],[Languages,analysis.video.language.toUpperCase(),'Language'],[Captions,'Available','Subtitles'],[Sparkles,String(analysis.vocabulary.length),'Useful words']].map(([Icon,value,label])=>{const Metric=Icon as typeof Clock3;return <div className="p-4 md:p-5 border-r last:border-r-0" style={{borderColor:'var(--line)'}} key={label as string}><Metric size={17} className="muted mb-2"/><b className="block text-lg">{value as string}</b><span className="muted text-xs">{label as string}</span></div>})}</div></section>

      <section className="card p-5 md:p-6 space-y-5"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><p className="muted text-sm">Found</p><h2 className="text-2xl font-black">{analysis.vocabulary.length} useful words <span className="muted text-base font-medium">· {knownCount} already known · {analysis.vocabulary.length-knownCount} new</span></h2></div><div className="flex gap-3"><button className="btn secondary" disabled={!selectedItems.length} onClick={()=>addItems(selectedItems)}><Plus size={18}/>Add selected ({selectedItems.length})</button><button className="btn primary" disabled={!analysis.vocabulary.some(item=>!knownByWord.has(wordKey(item.word)))} onClick={()=>addItems(analysis.vocabulary.filter(item=>!ignoredIds.includes(item.id)))}><Check size={18}/>Add all</button></div></div>
        <div className="pt-5 border-t" style={{borderColor:'var(--line)'}}><div className="flex items-center gap-2 font-bold mb-3"><Filter size={18}/>Filters</div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"><label className="btn justify-start"><input type="checkbox" checked={allVisibleSelected} onChange={event=>setSelectedIds(ids=>event.target.checked?[...new Set([...ids,...selectableVisible.map(item=>item.id)])]:ids.filter(id=>!selectableVisible.some(item=>item.id===id)))}/>Select all visible</label><label className="btn justify-start"><input type="checkbox" checked={onlyUnknown} onChange={event=>setOnlyUnknown(event.target.checked)}/>Only unknown words</label><label className="btn justify-start"><input type="checkbox" checked={onlyB2Plus} onChange={event=>setOnlyB2Plus(event.target.checked)}/>Only B2+</label><label className="btn justify-start"><input type="checkbox" checked={partFilter==='Verb'} onChange={event=>setPartFilter(event.target.checked?'Verb':'all')}/>Only verbs</label><label className="btn justify-start"><input type="checkbox" checked={partFilter==='Noun'} onChange={event=>setPartFilter(event.target.checked?'Noun':'all')}/>Only nouns</label><label className="btn justify-start"><input type="checkbox" checked={partFilter==='Adjective'} onChange={event=>setPartFilter(event.target.checked?'Adjective':'all')}/>Only adjectives</label></div><label className="block mt-4 max-w-sm"><span className="text-sm font-bold">Show vocabulary from level</span><div className="relative mt-2"><select value={minimumLevel} onChange={event=>setMinimumLevel(event.target.value as CefrLevel)}>{CEFR_LEVELS.map(level=><option value={level} key={level}>{level}{level===nextCefrLevel(store.settings.learnerLevel)?' · recommended for you':''}</option>)}</select><ChevronDown className="absolute right-4 top-4 pointer-events-none muted" size={17}/></div></label></div>
      </section>
      {notice&&<p role="status" className="text-sm font-medium" style={{color:'var(--success)'}}>{notice}</p>}
      <section className="space-y-4">{visibleVocabulary.length?visibleVocabulary.map(item=>{const known=knownByWord.get(wordKey(item.word));return <YouTubeVocabularyCard key={item.id} item={item} selected={selectedIds.includes(item.id)} isKnown={Boolean(known)} onSelectedChange={checked=>setSelectedIds(ids=>checked?[...new Set([...ids,item.id])]:ids.filter(id=>id!==item.id))} onAdd={()=>addItems([item])} onIgnore={()=>{setIgnoredIds(ids=>[...ids,item.id]);setSelectedIds(ids=>ids.filter(id=>id!==item.id))}} onReview={()=>reviewAgain(item)} onPlay={()=>playPronunciation(item)}/>;}):<div className="card p-8 text-center"><h2 className="font-black text-xl">No words match these filters</h2><p className="muted mt-2">Try lowering the minimum level or changing the selection filters.</p></div>}</section>
    </>}
  </div>;
}
