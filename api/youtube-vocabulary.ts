import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {ProxyAgent,fetch as undiciFetch} from 'undici';
import type {VercelRequest,VercelResponse} from '@vercel/node';
import {applyCors} from './_lib/http';
import {curateTranscript,parseYoutubeUrl,TranscriptCue,VideoVocabularyItem} from './_lib/youtube-vocabulary';
import {StudyLanguage} from './_lib/types';
import englishDictionaryWords from 'an-array-of-english-words';
import germanDictionaryWords from 'an-array-of-german-words';
import englishFrequency from './_data/en.json';
import germanFrequency from './_data/de.json';

type CaptionTrack={baseUrl:string;languageCode:string;kind?:string};
type PlayerResponse={videoDetails?:{title?:string;lengthSeconds?:string;videoId?:string};playabilityStatus?:{status?:string;reason?:string};captions?:{playerCaptionsTracklistRenderer?:{captionTracks?:CaptionTrack[]}}};
type CaptionPayload={events?:Array<{tStartMs?:number;segs?:Array<{utf8?:string}>}>};
type DeepLResponse={translations?:Array<{text:string}>};
type TimedTextTrackListEntry={languageCode:string;kind?:string;name?:string};
type YtDlpSubtitleEntry={ext?:string;url?:string;name?:string;protocol?:string;impersonate?:boolean};
type YtDlpInfo={title?:string;duration?:number;subtitles?:Record<string,YtDlpSubtitleEntry[]>;automatic_captions?:Record<string,YtDlpSubtitleEntry[]>};
type FallbackCandidate={word:string;count:number;example:string;timestampSeconds:number};

class YouTubeVocabularyError extends Error{constructor(public code:string){super(code)}}

const execFileAsync=promisify(execFile);
const cleanCaptionText=(value:string)=>value.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
const normalizeTrackLanguage=(value:string)=>value.toLowerCase().replace(/^a\./,'').split(/[-_]/)[0];
const normalizeToken=(value:string)=>value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}0-9'-]+/gu,'').trim();

const englishStopwords=new Set(['the','and','you','that','with','this','from','have','for','are','was','were','there','what','when','where','which','your','their','they','them','will','would','could','should','about','after','before','into','over','under','between','because','while','than','then','those','these','here','very','just','also','only','more','most','some','such','each','much','many','like','been','being','through','during','without','within','again','ever','never','even','make','made','get','got','take','takes','took','think','know','said','say','says','yes','no','not','can','cannot','dont','does','did','doing','done','one','two','three','let','lets','video','videos','minute','english','german','learn','learning','gotta','wanna','gonna','kinda','sorta','gimme','lemme']);
const germanStopwords=new Set(['der','die','das','und','oder','aber','weil','dass','mit','von','für','auf','ist','sind','war','waren','sein','hat','haben','hatte','werden','wird','nicht','nur','auch','noch','schon','sehr','mehr','weniger','dies','diese','dieser','dieses','hier','dort','dann','wenn','wie','was','wer','wo','warum','man','wir','ihr','sie','ich','du','er','es','ein','eine','einer','eines','einem','einen','zum','zur','ins','im','am','an','bei','nach','vor','über','unter','zwischen','ohne','gegen','während','video','videos','minute','deutsch','deutsche','lernen','lern']);

const englishDictionary=new Set(englishDictionaryWords as string[]);
const germanDictionary=new Set(germanDictionaryWords as string[]);
const englishFrequencyRank=new Map((englishFrequency as string[]).map((word,index)=>[word,index]));
const germanFrequencyRank=new Map((germanFrequency as string[]).map((word,index)=>[word,index]));

function selectDictionary(language:StudyLanguage){
  return language==='english'?englishDictionary:germanDictionary;
}

function isRealWord(word:string,language:StudyLanguage){
  const dictionary=selectDictionary(language);
  if(dictionary.has(word))return true;
  if(!word.includes('-'))return false;
  return word.split('-').every(part=>part.length>0&&dictionary.has(part));
}

const proxyUrl=process.env.YOUTUBE_PROXY_URL;
const proxyAgent=proxyUrl?new ProxyAgent(proxyUrl):null;
const browserHeaders={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36','Accept-Language':'en-US,en;q=0.9','Referer':'https://www.youtube.com/'};

async function withRetry<T>(attempt:()=>Promise<T>,attempts=3){
  let lastError:unknown;
  for(let index=0;index<attempts;index++){
    try{return await attempt()}
    catch(error){lastError=error;if(index<attempts-1)await new Promise(resolve=>setTimeout(resolve,300*(index+1)))}
  }
  throw lastError;
}

async function fetchWithTimeout(url:string,init?:RequestInit){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{return await undiciFetch(url,{...init,signal:controller.signal,cache:'no-store',...(proxyAgent?{dispatcher:proxyAgent}:{})} as Parameters<typeof undiciFetch>[1]) as unknown as Response}catch(error){if((error as Error).name==='AbortError')throw new YouTubeVocabularyError('TIMEOUT');throw new YouTubeVocabularyError('NETWORK_ERROR')}finally{clearTimeout(timer)}
}

function readTimedTextTracks(source:string){
  return [...source.matchAll(/<track\b([^>]*)\/>/g)].map(match=>{
    const attributes=Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(([_,key,value])=>[key,value]));
    return {
      languageCode:attributes.lang_code||'',
      kind:attributes.kind||undefined,
      name:attributes.name||undefined,
    } satisfies TimedTextTrackListEntry;
  }).filter(track=>track.languageCode);
}

const INNERTUBE_API_KEY='AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
const INNERTUBE_CLIENTS=[
  {clientName:'ANDROID',clientVersion:'21.03.36',androidSdkVersion:36,hl:'en',gl:'US',userAgent:'com.google.android.youtube/21.03.36(Linux; U; Android 16; en_US; SM-S908E Build/TP1A.220624.014) gzip'},
  {clientName:'ANDROID_VR',clientVersion:'1.65.10',deviceMake:'Oculus',deviceModel:'Quest 3',androidSdkVersion:32,hl:'en',gl:'US',userAgent:'com.google.android.apps.youtube.vr.oculus/1.65.10 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip'},
  {clientName:'IOS',clientVersion:'20.11.6',deviceModel:'iPhone10,4',osName:'iOS',osVersion:'16.7.7.20H330',hl:'en',gl:'US',userAgent:'com.google.ios.youtube/20.11.6 (iPhone10,4; U; CPU iOS 16_7_7 like Mac OS X)'},
];

async function requestPlayer(videoId:string,client:typeof INNERTUBE_CLIENTS[number]){
  const response=await fetchWithTimeout(`https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_API_KEY}`,{
    method:'POST',
    headers:{'Content-Type':'application/json','User-Agent':client.userAgent},
    body:JSON.stringify({videoId,context:{client}}),
  });
  if(!response.ok)throw new YouTubeVocabularyError(response.status===404?'VIDEO_UNAVAILABLE':'NETWORK_ERROR');
  let player:PlayerResponse;
  try{player=await response.json() as PlayerResponse}catch{throw new YouTubeVocabularyError('VIDEO_UNAVAILABLE')}
  if(player.playabilityStatus?.status&&player.playabilityStatus.status!=='OK')throw new YouTubeVocabularyError(player.playabilityStatus.status==='LOGIN_REQUIRED'?'PRIVATE_VIDEO':'VIDEO_UNAVAILABLE');
  return player;
}

async function getPlayerResponse(videoId:string){
  let lastError:unknown;
  for(const client of INNERTUBE_CLIENTS){
    try{return await withRetry(()=>requestPlayer(videoId,client),2)}
    catch(error){lastError=error}
  }
  throw lastError;
}

async function getTranscript(track:CaptionTrack){
  return withRetry(async()=>{
    const url=new URL(track.baseUrl);
    url.searchParams.set('fmt','json3');
    const response=await fetchWithTimeout(url.toString(),{headers:browserHeaders});
    if(!response.ok)throw new YouTubeVocabularyError('NO_SUBTITLES');
    let payload:CaptionPayload;
    try{payload=await response.json() as CaptionPayload}catch{throw new YouTubeVocabularyError('NO_SUBTITLES')}
    const cues=(payload.events||[]).map(event=>({text:cleanCaptionText((event.segs||[]).map(segment=>segment.utf8||'').join('')),startSeconds:Math.max(0,Math.round((event.tStartMs||0)/1000))})).filter((cue):cue is TranscriptCue=>Boolean(cue.text));
    if(!cues.length)throw new YouTubeVocabularyError('NO_SUBTITLES');
    return cues;
  });
}

function selectStopwords(language:StudyLanguage){
  return language==='english'?englishStopwords:germanStopwords;
}

function normalizeCandidateWord(value:string){
  return normalizeToken(value).replace(/^'+|'+$/g,'');
}

function candidateStems(word:string,language:StudyLanguage){
  const stems=[word];
  if(language==='german'){
    for(const suffix of ['en','em','er','es','e','st','t'])if(word.length>suffix.length+2&&word.endsWith(suffix))stems.push(word.slice(0,-suffix.length));
    return stems;
  }
  const pushDoubledConsonant=(base:string)=>{if(base.length>2&&base.at(-1)===base.at(-2)&&!'aeiou'.includes(base.at(-1)!))stems.push(base.slice(0,-1))};
  if(word.endsWith('ies')&&word.length>4)stems.push(word.slice(0,-3)+'y');
  else if(word.endsWith('es')&&word.length>4)stems.push(word.slice(0,-2));
  else if(word.endsWith('s')&&!word.endsWith('ss')&&word.length>3)stems.push(word.slice(0,-1));
  if(word.endsWith('ied')&&word.length>4)stems.push(word.slice(0,-3)+'y');
  if(word.endsWith('ing')&&word.length>5){const base=word.slice(0,-3);stems.push(base,base+'e');pushDoubledConsonant(base)}
  if(word.endsWith('ed')&&word.length>4){const base=word.slice(0,-2);stems.push(base,base+'e');pushDoubledConsonant(base)}
  return stems;
}

function frequencyRank(word:string,language:StudyLanguage){
  const map=language==='english'?englishFrequencyRank:germanFrequencyRank;
  let best:number|undefined;
  for(const stem of candidateStems(word,language)){
    const rank=map.get(stem);
    if(rank!==undefined&&(best===undefined||rank<best))best=rank;
  }
  return best;
}

function estimateLevel(word:string,language:StudyLanguage):VideoVocabularyItem['level']{
  const rank=frequencyRank(word,language);
  if(rank===undefined)return word.length<=9?'C1':'C2';
  if(rank<1000)return 'A1';
  if(rank<2500)return 'A2';
  if(rank<5000)return 'B1';
  if(rank<9000)return 'B2';
  return 'C1';
}

function inferPartOfSpeech(word:string,language:StudyLanguage){
  const lower=word.toLocaleLowerCase();
  if(language==='english'){
    if(/(ing|ed|en|ize|ise|ify|ate|ing's)$/.test(lower))return 'Verb';
    if(/(ous|ful|less|able|ible|ive|al|ic|ary|ant|ent)$/.test(lower))return 'Adjective';
    return 'Noun';
  }
  if(/(en|ern|ieren|isieren|machen|gehen|kommen)$/.test(lower))return 'Verb';
  if(/(lich|ig|isch|bar|los|sam|haft)$/.test(lower))return 'Adjective';
  return 'Noun';
}

function categoryForPartOfSpeech(partOfSpeech:string){
  if(partOfSpeech==='Verb')return 'verbs';
  if(partOfSpeech==='Adjective')return 'adjectives';
  return 'other';
}

function collectFallbackCandidates(cues:TranscriptCue[],language:StudyLanguage,excludeWords:Set<string>){
  const stopwords=selectStopwords(language);
  const occurrences=new Map<string,{count:number;example:string;timestampSeconds:number}>();
  for(const cue of cues){
    for(const token of cue.text.split(/\s+/)){
      const word=normalizeCandidateWord(token);
      if(!word||word.length<4||word.includes('\'')||stopwords.has(word)||excludeWords.has(word)||!isRealWord(word,language))continue;
      const current=occurrences.get(word);
      if(current)current.count++;
      else occurrences.set(word,{count:1,example:cue.text.trim(),timestampSeconds:cue.startSeconds});
    }
  }
  return [...occurrences.entries()].map(([word,data])=>({word,...data})).sort((left,right)=>right.count-left.count||right.word.length-left.word.length||left.word.localeCompare(right.word)).slice(0,20) as FallbackCandidate[];
}

async function translateBatch(texts:string[],sourceLanguage:StudyLanguage){
  const key=process.env.DEEPL_API_KEY;
  if(!key||!texts.length)return texts.map(()=> '');
  const base=(process.env.DEEPL_API_URL||(key.endsWith(':fx')?'https://api-free.deepl.com':'https://api.deepl.com')).replace(/\/$/,'');
  const response=await fetchWithTimeout(`${base}/v2/translate`,{method:'POST',headers:{Authorization:`DeepL-Auth-Key ${key}`,'Content-Type':'application/json'},body:JSON.stringify({text:texts,source_lang:sourceLanguage==='english'?'EN':'DE',target_lang:'RU'})});
  if(!response.ok)return texts.map(()=> '');
  const data=await response.json() as DeepLResponse;
  return texts.map((_,index)=>data.translations?.[index]?.text||'');
}

async function buildFallbackVocabulary(cues:TranscriptCue[],language:StudyLanguage,existingWords:Set<string>){
  const candidates=collectFallbackCandidates(cues,language,existingWords);
  if(!candidates.length)return [];
  const translations=await translateBatch(candidates.map(candidate=>candidate.word),language);
  return candidates.map((candidate,index)=>{
    const partOfSpeech=inferPartOfSpeech(candidate.word,language);
    return {
      id:`${language}:fallback:${candidate.word}`,
      word:candidate.word,
      pronunciation:'',
      partOfSpeech,
      level:estimateLevel(candidate.word,language),
      translationRu:translations[index]||candidate.word,
      explanation:'Word from the video transcript.',
      example:candidate.example,
      exampleTranslationRu:'',
      synonyms:[],
      antonyms:[],
      categoryId:categoryForPartOfSpeech(partOfSpeech),
      timestampSeconds:candidate.timestampSeconds,
    } satisfies VideoVocabularyItem;
  });
}

function scoreSubtitleKey(key:string,language:StudyLanguage){
  const requested=language==='english'?'en':'de';
  const normalized=normalizeTrackLanguage(key);
  return (normalized===requested?4:0)+(key.toLowerCase().startsWith(requested)?2:0);
}

function pickYtDlpSubtitleUrl(info:YtDlpInfo,language:StudyLanguage){
  const subtitleGroups=[info.subtitles||{},info.automatic_captions||{}];
  const candidates=subtitleGroups.flatMap((group,groupIndex)=>Object.entries(group).flatMap(([key,tracks])=>tracks.map(track=>({key,track,groupIndex}))));
  const scored=candidates
    .filter(({track})=>track.ext==='json3'&&track.url)
    .map(({key,track,groupIndex})=>({url:track.url as string,score:scoreSubtitleKey(key,language)+(groupIndex===0?1:0)+(track.impersonate?1:0)}))
    .sort((left,right)=>right.score-left.score);
  return scored[0]?.url||null;
}

async function getTranscriptFromYtDlp(videoUrl:string,language:StudyLanguage){
  const commands=[
    ['python',['-m','yt_dlp','-J','--skip-download','--no-warnings','--no-playlist',videoUrl]],
    ['py',['-3','-m','yt_dlp','-J','--skip-download','--no-warnings','--no-playlist',videoUrl]],
  ] as const;
  let lastError='';
  for(const [command,args] of commands){
    try{
      const {stdout}=await execFileAsync(command,args,{timeout:15000,maxBuffer:5_000_000});
      const info=JSON.parse(stdout) as YtDlpInfo;
      const subtitleUrl=pickYtDlpSubtitleUrl(info,language);
      if(!subtitleUrl)continue;
      const response=await fetchWithTimeout(subtitleUrl,{headers:browserHeaders});
      if(!response.ok)continue;
      let payload:CaptionPayload;
      try{payload=await response.json() as CaptionPayload}catch{continue}
      const cues=(payload.events||[]).map(event=>({text:cleanCaptionText((event.segs||[]).map(segment=>segment.utf8||'').join('')),startSeconds:Math.max(0,Math.round((event.tStartMs||0)/1000))})).filter((cue):cue is TranscriptCue=>Boolean(cue.text));
      if(cues.length)return cues;
    }catch(error){
      lastError=error instanceof Error?error.message:String(error);
    }
  }
  if(lastError)console.warn('[youtube-vocabulary] yt-dlp fallback failed:',lastError);
  return null;
}

async function getTrackList(videoId:string){
  const response=await fetchWithTimeout(`https://www.youtube.com/api/timedtext?v=${encodeURIComponent(videoId)}&type=list&hl=en`,{headers:browserHeaders});
  if(!response.ok)return [];
  const xml=await response.text();
  return readTimedTextTracks(xml).map(track=>({
    languageCode:track.languageCode,
    kind:track.kind,
    baseUrl:`https://www.youtube.com/api/timedtext?v=${encodeURIComponent(videoId)}&lang=${encodeURIComponent(track.languageCode)}&fmt=json3${track.kind==='asr'?'&kind=asr':''}${track.name?`&name=${encodeURIComponent(track.name)}`:''}`,
  }));
}

function pickCaptionTrack(tracks:CaptionTrack[],language:StudyLanguage){
  const requested=language==='english'?'en':'de';
  const scoredTracks=tracks.map(track=>{
    const normalized=normalizeTrackLanguage(track.languageCode);
    const isExact=normalized===requested;
    const isPrefix=track.languageCode.toLowerCase().startsWith(requested);
    const isAuto=track.kind==='asr';
    return {
      track,
      score:(isExact?4:0)+(isPrefix?2:0)+(isAuto?-1:0),
    };
  }).sort((left,right)=>right.score-left.score);
  return scoredTracks[0]?.score>0?scoredTracks[0].track:null;
}

async function translateExamples(items:VideoVocabularyItem[],language:StudyLanguage){
  if(!items.length)return items;
  try{
    const translations=await translateBatch(items.map(item=>item.example),language);
    return items.map((item,index)=>({...item,exampleTranslationRu:translations[index]||''}));
  }catch{return items}
}

export default async function handler(req:VercelRequest,res:VercelResponse){
  if(applyCors(req,res))return;
  if(req.method!=='POST')return res.status(405).json({error:'METHOD_NOT_ALLOWED'});
  try{
    const body=(req.body||{}) as {url?:string;language?:StudyLanguage};
    const source=body.url?parseYoutubeUrl(body.url):null;
    if(!source)throw new YouTubeVocabularyError('INVALID_URL');
    if(body.language!=='english'&&body.language!=='german')throw new YouTubeVocabularyError('UNSUPPORTED_LANGUAGE');
    const player=await getPlayerResponse(source.id);
    const tracks=[...(player.captions?.playerCaptionsTracklistRenderer?.captionTracks||[]),...(await getTrackList(source.id))];
    if(!tracks.length)throw new YouTubeVocabularyError('NO_SUBTITLES');
    const track=pickCaptionTrack(tracks,body.language);
    if(!track)throw new YouTubeVocabularyError('UNSUPPORTED_LANGUAGE');

    let transcript:TranscriptCue[]=[];
    try{transcript=await getTranscript(track)}catch{transcript=[]}
    if(!transcript.length){
      const fallbackTranscript=await getTranscriptFromYtDlp(source.url,body.language);
      if(fallbackTranscript?.length)transcript=fallbackTranscript;
    }
    if(!transcript.length)throw new YouTubeVocabularyError('CAPTION_FETCH_BLOCKED');

    const curated=curateTranscript(transcript,body.language);
    const fallback=curated.length>=8?[]:await buildFallbackVocabulary(transcript,body.language,new Set(curated.map(item=>normalizeCandidateWord(item.word))));
    const combined=[...curated,...fallback];
    const deduped=combined.filter((item,index,array)=>array.findIndex(other=>normalizeCandidateWord(other.word)===normalizeCandidateWord(item.word))===index).slice(0,24);
    const vocabulary=await translateExamples(deduped,body.language);
    if(!vocabulary.length)throw new YouTubeVocabularyError('NO_USEFUL_VOCABULARY');

    return res.status(200).json({
      video:{
        id:source.id,
        title:player.videoDetails?.title||'YouTube video',
        url:source.url,
        durationSeconds:Number(player.videoDetails?.lengthSeconds||0),
        language:track.languageCode,
        subtitleAvailability:'available',
      },
      vocabulary,
      transcriptWordCount:transcript.reduce((count,cue)=>count+cue.text.split(/\s+/).filter(Boolean).length,0),
    });
  }catch(error){
    const code=error instanceof YouTubeVocabularyError?error.code:'NETWORK_ERROR';
    const status=code==='INVALID_URL'?400:code==='NO_SUBTITLES'||code==='UNSUPPORTED_LANGUAGE'||code==='NO_USEFUL_VOCABULARY'?422:code==='TIMEOUT'?504:code==='CAPTION_FETCH_BLOCKED'?503:502;
    return res.status(status).json({error:code});
  }
}
