import {Platform} from 'react-native';
import {StudyLanguage} from '@/types';
import {VideoAnalysis} from '@/lib/youtube-vocabulary';

// The web build is served by the same deployment as the API, so it calls a
// relative path and stays same-origin — an absolute URL would be cross-origin
// on every deployment except production and get blocked by CORS. Native has no
// origin to be relative to, so it needs the deployed URL.
// Either can be pointed elsewhere with EXPO_PUBLIC_API_BASE_URL in mobile/.env.
const DEFAULT_API_BASE_URL='https://words-ten-lemon.vercel.app';
const configuredBaseUrl=process.env.EXPO_PUBLIC_API_BASE_URL;
const API_BASE_URL=(configuredBaseUrl??(Platform.OS==='web'?'':DEFAULT_API_BASE_URL)).replace(/\/$/,'');

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
