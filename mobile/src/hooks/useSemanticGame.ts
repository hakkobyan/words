import {useEffect,useMemo,useState} from 'react';
import {getDailyHuntTargets,WordHuntTarget} from '@/data/wordHunt';
import {getSemanticRank,proximityForRank,rewardFor,SemanticGuess} from '@/lib/semanticRanking';
import {useVocabularyStore} from '@/store/useVocabularyStore';
import {WordHuntLevel} from '@/types';

export type GameStatus='playing'|'reveal'|'practice'|'complete';

function nextTarget(targets:WordHuntTarget[],completed:Set<string>,lastId?:string){
  const available=targets.filter(target=>!completed.has(target.id));
  if(!available.length)return targets[targets.length-1];
  const lastIndex=available.findIndex(target=>target.id===lastId);
  return lastIndex<0?available[0]:available[(lastIndex+1)%available.length];
}

export function useSemanticGame(){
  const progress=useVocabularyStore(s=>s.wordHuntProgress);
  const completeWord=useVocabularyStore(s=>s.completeWordHunt);
  const rememberTarget=useVocabularyStore(s=>s.rememberWordHuntTarget);
  const level=useVocabularyStore(s=>s.settings.wordHuntLevel);
  const setSettings=useVocabularyStore(s=>s.setSettings);
  const targets=getDailyHuntTargets(level);
  const targetIds=new Set(targets.map(item=>item.id));
  const completedToday=progress.date===new Date().toISOString().slice(0,10)?progress.completedIds.filter(id=>targetIds.has(id)):[];
  const completedSet=new Set(completedToday);
  const candidate=nextTarget(targets,completedSet,progress.lastServedByLevel?.[level]);
  const [selection,setSelection]=useState<{level:WordHuntLevel;id:string}>(()=>({level,id:candidate.id}));
  const selected=selection.level===level&&!completedSet.has(selection.id)?targets.find(item=>item.id===selection.id):undefined;
  const target=selected??candidate;
  const [guess,setGuess]=useState('');
  const [guesses,setGuesses]=useState<SemanticGuess[]>([]);
  const [status,setStatus]=useState<GameStatus>('playing');
  const [hintsUsed,setHintsUsed]=useState(0);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const [practiceAnswer,setPracticeAnswer]=useState<number|null>(null);
  const [reward,setReward]=useState(0);

  useEffect(()=>{
    if(selection.level!==level||selection.id!==target.id)setSelection({level,id:target.id});
    rememberTarget(level,target.id);
  },[level,target.id]);

  useEffect(()=>{
    setGuess('');setGuesses([]);setStatus('playing');setHintsUsed(0);setError('');setPracticeAnswer(null);setReward(0);
  },[level]);

  const bestRank=useMemo(()=>guesses.reduce((best,item)=>Math.min(best,item.rank),Infinity),[guesses]);
  const feedback=bestRank<=15?'very-close':bestRank<=75?'close':bestRank<=250?'warm':bestRank<Infinity?'far':'none';

  const submit=async()=>{
    const clean=guess.trim().toLowerCase();
    setError('');
    if(!clean){setError('EMPTY');return}
    if(guesses.some(item=>item.word===clean)){setError('DUPLICATE');return}
    setLoading(true);
    try{
      const rank=await getSemanticRank(target,clean);
      const next=[...guesses,{word:clean,rank,createdAt:new Date().toISOString()}];
      setGuesses(next);setGuess('');
      if(rank===1){setReward(rewardFor(next.length,hintsUsed));setStatus('reveal')}
    }catch(e){setError((e as Error).message==='INVALID'?'INVALID':'NETWORK')}
    finally{setLoading(false)}
  };

  const useHint=()=>{if(hintsUsed<3)setHintsUsed(value=>value+1)};
  const answerPractice=(index:number)=>setPracticeAnswer(index);
  const finishPractice=()=>setStatus('complete');
  const nextWord=()=>{
    completeWord(target.id,reward);
    setGuess('');setGuesses([]);setStatus('playing');setHintsUsed(0);setError('');setPracticeAnswer(null);setReward(0);
  };

  return {target,targets,completedToday,level,setLevel:(next:typeof level)=>setSettings({wordHuntLevel:next}),guess,setGuess,guesses,status,setStatus,hintsUsed,useHint,error,loading,submit,bestRank,feedback,practiceAnswer,answerPractice,finishPractice,reward,nextWord,proximityForRank,allComplete:completedToday.length>=targets.length};
}
