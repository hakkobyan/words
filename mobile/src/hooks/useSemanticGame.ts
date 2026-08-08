import {useMemo,useState} from 'react';
import {getDailyHuntTargets} from '@/data/wordHunt';
import {getSemanticRank,proximityForRank,rewardFor,SemanticGuess} from '@/lib/semanticRanking';
import {useVocabularyStore} from '@/store/useVocabularyStore';

export type GameStatus='playing'|'reveal'|'practice'|'complete';

export function useSemanticGame(){
  const progress=useVocabularyStore(s=>s.wordHuntProgress);
  const completeWord=useVocabularyStore(s=>s.completeWordHunt);
  const targets=getDailyHuntTargets();
  const completedToday=progress.date===new Date().toISOString().slice(0,10)?progress.completedIds:[];
  const currentIndex=Math.min(completedToday.length,targets.length-1);
  const target=targets[currentIndex];
  const [guess,setGuess]=useState('');
  const [guesses,setGuesses]=useState<SemanticGuess[]>([]);
  const [status,setStatus]=useState<GameStatus>('playing');
  const [hintsUsed,setHintsUsed]=useState(0);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const [practiceAnswer,setPracticeAnswer]=useState<number|null>(null);
  const [reward,setReward]=useState(0);

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

  return {target,targets,completedToday,guess,setGuess,guesses,status,setStatus,hintsUsed,useHint,error,loading,submit,bestRank,feedback,practiceAnswer,answerPractice,finishPractice,reward,nextWord,proximityForRank,allComplete:completedToday.length>=targets.length};
}
