import Constants from 'expo-constants';
import {StudyLanguage} from '@/types';
import {VideoAnalysis} from '@/lib/youtube-vocabulary';

const API_BASE_URL=((Constants.expoConfig?.extra?.apiBaseUrl as string|undefined)??'').replace(/\/$/,'');

export async function translateWord(text:string,sourceLanguage:StudyLanguage,signal?:AbortSignal){
  const response=await fetch(`${API_BASE_URL}/api/translate`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({text,sourceLanguage}),
    signal,
  });
  const data=await response.json() as {suggestions?:string[];error?:string};
  if(!response.ok)throw new Error(data.error||'Translate failed');
  return data.suggestions??[];
}

export async function analyzeYoutubeVideo(url:string,language:StudyLanguage){
  const response=await fetch(`${API_BASE_URL}/api/youtube-vocabulary`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({url,language}),
  });
  const data=await response.json() as VideoAnalysis&{error?:string};
  if(!response.ok)throw new Error(data.error||'NETWORK_ERROR');
  return data;
}
