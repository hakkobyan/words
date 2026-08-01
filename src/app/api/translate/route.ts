import {NextResponse} from 'next/server';

type RequestBody={text?:string;sourceLanguage?:'english'|'german'};
type DeepLResponse={translations?:Array<{text:string}>};
type CacheEntry={expiresAt:number;suggestions:string[]};

const cache=new Map<string,CacheEntry>();
const CACHE_TTL=24*60*60*1000;
function contextsFor(word:string,language:'english'|'german'){
  return language==='english'?[
    `In this passage, “${word}” relates to ordinary people, objects, and everyday actions.`,
    `In this passage, “${word}” relates to money, work, science, or technology.`,
    `In this passage, “${word}” relates to nature, a physical object, place, or movement.`,
    `In this passage, “${word}” expresses an abstract idea, emotion, or figurative meaning.`,
  ]:[
    `In diesem Text bezieht sich „${word}“ auf Menschen, Dinge und Handlungen im Alltag.`,
    `In diesem Text bezieht sich „${word}“ auf Geld, Arbeit, Wissenschaft oder Technik.`,
    `In diesem Text bezieht sich „${word}“ auf Natur, einen Gegenstand, Ort oder eine Bewegung.`,
    `In diesem Text drückt „${word}“ eine abstrakte Idee, Emotion oder bildliche Bedeutung aus.`,
  ];
}
function uniqueSuggestions(values:string[]){
  const seen=new Set<string>(),result:string[]=[];
  for(const value of values){
    const clean=value.trim().replace(/[.!]+$/,'');
    const normalized=clean.toLocaleLowerCase('ru');
    if(clean&&clean.length<=120&&!seen.has(normalized)){seen.add(normalized);result.push(clean)}
  }
  return result.slice(0,5);
}

export async function POST(request:Request){
  try{
    const {text,sourceLanguage}=await request.json() as RequestBody;
    const clean=text?.trim();
    if(!clean||!sourceLanguage)return NextResponse.json({error:'Укажите слово и язык.'},{status:400});
    if(clean.length>200)return NextResponse.json({error:'Слишком длинный текст.'},{status:400});

    const cacheKey=`v2:${sourceLanguage}:${clean.toLocaleLowerCase()}`;
    const cached=cache.get(cacheKey);
    if(cached&&cached.expiresAt>Date.now())return NextResponse.json({suggestions:cached.suggestions});

    const key=process.env.DEEPL_API_KEY;
    if(!key)return NextResponse.json({error:'Переводчик пока не настроен.'},{status:503});
    const base=(process.env.DEEPL_API_URL||(key.endsWith(':fx')?'https://api-free.deepl.com':'https://api.deepl.com')).replace(/\/$/,'');
    const sourceLang=sourceLanguage==='english'?'EN':'DE';
    const responses=await Promise.all(contextsFor(clean,sourceLanguage).map(context=>fetch(`${base}/v2/translate`,{
      method:'POST',headers:{Authorization:`DeepL-Auth-Key ${key}`,'Content-Type':'application/json'},
      body:JSON.stringify({text:[clean],source_lang:sourceLang,target_lang:'RU',context}),cache:'no-store',
    })));
    if(responses.some(response=>response.status===403))return NextResponse.json({error:'Ключ DeepL недействителен.'},{status:403});

    const payloads=await Promise.all(responses.map(async response=>response.ok?await response.json() as DeepLResponse:null));
    const suggestions=uniqueSuggestions(payloads.flatMap(data=>data?.translations?.map(item=>item.text)??[]));
    if(!suggestions.length)return NextResponse.json({error:'Не удалось получить перевод.'},{status:502});

    if(cache.size>=500)cache.delete(cache.keys().next().value as string);
    cache.set(cacheKey,{expiresAt:Date.now()+CACHE_TTL,suggestions});
    return NextResponse.json({suggestions});
  }catch{return NextResponse.json({error:'Ошибка сервиса перевода.'},{status:500})}
}