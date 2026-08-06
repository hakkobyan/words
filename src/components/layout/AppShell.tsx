'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useSyncExternalStore} from 'react';
import {Brain,Home,Layers3,Library,Menu,Plus,Settings,Tv} from 'lucide-react';
import {useVocabularyStore} from '@/store/useVocabularyStore';
import {useI18n} from '@/lib/i18n';
import Onboarding from '@/components/onboarding/Onboarding';
import DailyWords from '@/components/daily/DailyWords';
import {dailySession} from '@/lib/dailyWords';

export default function AppShell({children}:{children:React.ReactNode}){
  const pathname=usePathname(),{hydrate,isHydrated,settings,setSettings}=useVocabularyStore(),{t}=useI18n();
  const dailyDone=useSyncExternalStore(dailySession.subscribe,dailySession.isHandled,dailySession.handledOnServer);
  useEffect(()=>hydrate(),[hydrate]);
  useEffect(()=>{const dark=settings.theme==='dark'||(settings.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);document.documentElement.lang=settings.interfaceLanguage==='en'?'en':'ru';},[settings.theme,settings.interfaceLanguage]);
  const nav=[['/',t('home'),Home],['/words',t('words'),Library],['/add',t('add'),Plus],['/youtube','YouTube',Tv],['/study',t('study'),Brain]] as const;
  const full=[...nav,['/categories',t('categories'),Layers3],['/sessions',t('sessions'),Library],['/settings',t('settings'),Settings]] as const;
  if(isHydrated&&!settings.onboardingCompleted)return <Onboarding/>;
  if(isHydrated&&!dailyDone)return <DailyWords onDone={dailySession.markHandled}/>;
  return <div className="min-h-screen"><aside className="hidden md:flex fixed inset-y-0 left-0 w-20 lg:w-64 p-4 lg:p-7 flex-col items-center lg:items-stretch border-r" style={{background:'var(--card)',borderColor:'var(--line)'}}><Link href="/" aria-label="words" className="text-2xl font-black mb-8 lg:self-start"><span className="lg:hidden">W</span><span className="hidden lg:inline">words</span></Link><div className="hidden lg:inline-flex p-1 rounded-xl mb-5" style={{background:'var(--paper-2)',border:'1px solid var(--line)'}}>{(['ru','en'] as const).map(language=><button key={language} className={`min-h-10 flex-1 rounded-lg font-bold ${settings.interfaceLanguage===language?'secondary':''}`} aria-pressed={settings.interfaceLanguage===language} onClick={()=>setSettings({interfaceLanguage:language})}>{language.toUpperCase()}</button>)}</div><nav className="space-y-2 w-full">{full.map(([href,label,Icon])=><Link key={href} href={href} title={label} aria-label={label} className={`btn w-full justify-center lg:justify-start ${pathname===href?'secondary':''}`}><Icon size={20}/><span className="hidden lg:inline">{label}</span></Link>)}</nav><p className="muted text-xs mt-auto hidden lg:block">{t('localOnly')}</p></aside><Link href="/settings" aria-label={t('more')} className="md:hidden fixed top-4 right-4 z-50 rounded-full p-2.5" style={{background:'var(--card)',border:'1px solid var(--line)',color:pathname==='/settings'?'var(--green)':'var(--muted)'}}><Menu size={20}/></Link><div className="md:ml-20 lg:ml-64"><main className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">{children}</main></div><nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-around border-t px-1 pt-2" style={{background:'var(--card)',borderColor:'var(--line)',paddingBottom:'calc(8px + env(safe-area-inset-bottom))'}}>{nav.map(([href,label,Icon],index)=><Link key={href} href={href} aria-label={label} className={`flex-1 min-w-0 flex flex-col items-center gap-1 text-[10px] ${pathname===href?'font-bold':''}`} style={{color:pathname===href?'var(--green)':'var(--muted)'}}><span className={index===2?'primary rounded-2xl p-3 -mt-7 shadow-lg':''}><Icon size={index===2?25:20}/></span>{label}</Link>)}</nav></div>;
}
