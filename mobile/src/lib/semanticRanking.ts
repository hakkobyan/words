import {WordHuntTarget} from '@/data/wordHunt';

export type SemanticGuess={word:string;rank:number;createdAt:string};
export type Proximity='correct'|'very-close'|'close'|'warm'|'far';

const normalize=(value:string)=>value.trim().toLowerCase();
const stableFarRank=(target:string,guess:string)=>{
  let hash=17;
  for(const char of `${target}:${guess}`)hash=(hash*31+char.charCodeAt(0))>>>0;
  return 350+(hash%3100);
};

export async function getSemanticRank(target:WordHuntTarget,rawGuess:string):Promise<number>{
  const guess=normalize(rawGuess);
  if(!guess)throw new Error('EMPTY');
  if(!/^[a-z][a-z' -]{1,30}$/.test(guess))throw new Error('INVALID');
  await new Promise(resolve=>setTimeout(resolve,240));
  if(guess===target.word)return 1;
  return target.neighbors[guess]??stableFarRank(target.word,guess);
}

export function proximityForRank(rank:number):Proximity{
  if(rank===1)return 'correct';
  if(rank<=15)return 'very-close';
  if(rank<=75)return 'close';
  if(rank<=250)return 'warm';
  return 'far';
}

export function rewardFor(guesses:number,hints:number){
  const hintReward=[30,20,10,5][Math.min(hints,3)];
  const speedBonus=guesses<=5?20:guesses<=10?10:0;
  return hintReward+speedBonus;
}
