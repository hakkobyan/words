'use client';

import {RefreshCw} from 'lucide-react';

export default function YouTubeError({reset}:{error:Error&{digest?:string};reset:()=>void}){
  return <div className="card p-8 text-center max-w-xl mx-auto"><h1 className="text-2xl font-black">Could not open YouTube Vocabulary</h1><p className="muted mt-2">Please try the page again.</p><button className="btn primary mt-5" onClick={reset}><RefreshCw size={18}/>Try again</button></div>;
}
