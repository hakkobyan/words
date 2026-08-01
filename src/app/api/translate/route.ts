import {NextResponse} from 'next/server';

type RequestBody={text?:string;sourceLanguage?:'english'|'german'};

export async function POST(request:Request){
  try{
    const {text,sourceLanguage}=await request.json() as RequestBody;
    const clean=text?.trim();
    if(!clean||!sourceLanguage)return NextResponse.json({error:'Укажите слово и язык.'},{status:400});
    if(clean.length>200)return NextResponse.json({error:'Слишком длинный текст.'},{status:400});
    const key=process.env.DEEPL_API_KEY;
    if(!key)return NextResponse.json({error:'Переводчик пока не настроен.'},{status:503});
    const base=(process.env.DEEPL_API_URL||(key.endsWith(':fx')?'https://api-free.deepl.com':'https://api.deepl.com')).replace(/\/$/,'');
    const response=await fetch(`${base}/v2/translate`,{method:'POST',headers:{Authorization:`DeepL-Auth-Key ${key}`,'Content-Type':'application/json'},body:JSON.stringify({text:[clean],source_lang:sourceLanguage==='english'?'EN':'DE',target_lang:'RU'}),cache:'no-store'});
    const data=await response.json() as {translations?:Array<{text:string}>;message?:string};
    if(!response.ok)return NextResponse.json({error:response.status===403?'Ключ DeepL недействителен.':'Не удалось получить перевод.'},{status:response.status});
    const translation=data.translations?.[0]?.text?.trim();
    if(!translation)return NextResponse.json({error:'DeepL не вернул перевод.'},{status:502});
    return NextResponse.json({suggestions:[translation]});
  }catch{return NextResponse.json({error:'Ошибка сервиса перевода.'},{status:500})}
}
