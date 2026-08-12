import {Platform} from 'react-native';
import {StudyLanguage} from '@/types';
import {VideoAnalysis} from '@/lib/youtube-vocabulary';

// The web build is served by the same deployment as the API, so it calls a
// relative path and stays same-origin — an absolute URL would be cross-origin
// on every deployment except production and get blocked by CORS. Native has no
// origin to be relative to, so it needs the deployed URL.
// Either can be pointed elsewhere with EXPO_PUBLIC_API_BASE_URL in mobile/.env.
const DEFAULT_API_BASE_URL='https://flip-fox.vercel.app';
const configuredBaseUrl=process.env.EXPO_PUBLIC_API_BASE_URL;
const API_BASE_URL=(configuredBaseUrl??(Platform.OS==='web'?'':DEFAULT_API_BASE_URL)).replace(/\/$/,'');

type ApiPayload={error?:string};

async function postJson<T extends ApiPayload>(path:string,body:unknown,{signal,timeoutMs,errorCode}:{signal?:AbortSignal;timeoutMs:number;errorCode:string}){
  let lastError:unknown;
  for(let attempt=0;attempt<2;attempt++){
    const controller=new AbortController();
    const abort=()=>controller.abort();
    signal?.addEventListener('abort',abort,{once:true});
    const timer=setTimeout(abort,timeoutMs);
    try{
      const response=await fetch(`${API_BASE_URL}${path}`,{
        method:'POST',
        headers:{Accept:'application/json','Content-Type':'application/json'},
        body:JSON.stringify(body),
        signal:controller.signal,
      });
      const raw=await response.text();
      let data:T;
      try{data=JSON.parse(raw) as T}catch{throw new Error(errorCode)}
      if(!response.ok)throw new Error(data.error||errorCode);
      return data;
    }catch(error){
      if(signal?.aborted)throw error;
      lastError=error;
      if(attempt===0)await new Promise(resolve=>setTimeout(resolve,350));
    }finally{
      clearTimeout(timer);
      signal?.removeEventListener('abort',abort);
    }
  }
  if(lastError instanceof Error&&lastError.name!=='AbortError')throw lastError;
  throw new Error(errorCode);
}

export async function translateWord(text:string,sourceLanguage:StudyLanguage,signal?:AbortSignal){
  const data=await postJson<{suggestions?:string[];error?:string}>('/api/translate',{text,sourceLanguage},{signal,timeoutMs:20000,errorCode:'Translate failed'});
  return data.suggestions??[];
}

export async function analyzeYoutubeVideo(url:string,language:StudyLanguage){
  return postJson<VideoAnalysis&{error?:string}>('/api/youtube-vocabulary',{url,language},{timeoutMs:75000,errorCode:'NETWORK_ERROR'});
}
