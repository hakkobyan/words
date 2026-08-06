import {StudyLanguage} from '@/types';
import {VideoAnalysis} from '@/lib/youtube-vocabulary';

// Production backend, deployed from the same repo's root Next.js app.
// Override locally by setting EXPO_PUBLIC_API_BASE_URL in mobile/.env
// (e.g. to point at a local `npm run dev` server instead).
const DEFAULT_API_BASE_URL='https://words-ten-lemon.vercel.app';
const API_BASE_URL=(process.env.EXPO_PUBLIC_API_BASE_URL??DEFAULT_API_BASE_URL).replace(/\/$/,'');

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
