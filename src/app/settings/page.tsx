'use client';

import {useRef,useState} from 'react';
import {Download,RotateCcw,Trash2,Upload} from 'lucide-react';
import {useVocabularyStore} from '@/store/useVocabularyStore';
import {backup} from '@/lib/storage';
import {useI18n} from '@/lib/i18n';
import {CEFR_LEVELS,CefrLevel} from '@/types';

export default function Settings(){
  const store=useVocabularyStore(),file=useRef<HTMLInputElement>(null),[message,setMessage]=useState(''),{locale,pick}=useI18n();
  const load=async(event:React.ChangeEvent<HTMLInputElement>)=>{
    try{
      const selectedFile=event.target.files?.[0];
      if(!selectedFile)return;
      const data=JSON.parse(await selectedFile.text());
      if(!Array.isArray(data.words)||!Array.isArray(data.categories)||!Array.isArray(data.sessions))throw new Error('INVALID_BACKUP');
      store.replaceData(data);
      setMessage(pick(`Импортировано ${data.words.length} слов`,`Imported ${data.words.length} words`));
    }catch{setMessage(pick('Некорректный файл резервной копии','Invalid backup file'))}
  };
  const toggles=[['showExamples',pick('Показывать примеры','Show examples')],['shuffle',pick('Перемешивать слова','Shuffle words')],['reverse',pick('Обратные вопросы','Reverse questions')],['autoCategory',pick('Автокатегории','Automatic categories')]] as const;
  return <div className="max-w-2xl"><p className="muted">{pick('Персонализация и данные','Personalization and data')}</p><h1 className="text-3xl font-black mb-6">{pick('Настройки','Settings')}</h1><section className="card p-5 space-y-5 mb-5"><h2 className="font-bold text-lg">{pick('Внешний вид','Appearance')}</h2><label className="block"><span className="text-sm font-bold">{pick('Язык интерфейса','Interface language')}</span><select className="mt-2" value={locale} onChange={event=>store.setSettings({interfaceLanguage:event.target.value as 'ru'|'en'})}><option value="ru">Русский</option><option value="en">English</option></select></label><label className="block"><span className="text-sm font-bold">{pick('Тема','Theme')}</span><select className="mt-2" value={store.settings.theme} onChange={event=>store.setSettings({theme:event.target.value as 'light'|'dark'|'system'})}><option value="system">{pick('Как в системе','System')}</option><option value="light">{pick('Светлая','Light')}</option><option value="dark">{pick('Тёмная','Dark')}</option></select></label></section><section className="card p-5 space-y-5 mb-5"><h2 className="font-bold text-lg">{pick('Обучение','Learning')}</h2><label className="block"><span className="text-sm font-bold">{pick('Ваш текущий уровень','Your current level')}</span><select className="mt-2" value={store.settings.learnerLevel} onChange={event=>store.setSettings({learnerLevel:event.target.value as CefrLevel})}>{CEFR_LEVELS.map(level=><option value={level} key={level}>{level}</option>)}</select><p className="muted text-xs mt-2">{pick('YouTube Vocabulary сначала показывает уровень выше выбранного.','YouTube Vocabulary starts with levels above this selection.')}</p></label><label className="block">{pick('Карточек за сеанс','Cards per session')}: {store.settings.cardsPerSession}<input type="range" min="5" max="50" value={store.settings.cardsPerSession} onChange={event=>store.setSettings({cardsPerSession:+event.target.value})}/></label>{toggles.map(([key,label])=><label className="flex justify-between" key={key}>{label}<input type="checkbox" checked={store.settings[key]} onChange={event=>store.setSettings({[key]:event.target.checked})}/></label>)}</section><section className="card p-5"><h2 className="font-bold text-lg mb-4">{pick('Мои данные','My data')}</h2><div className="grid sm:grid-cols-2 gap-3"><button className="btn secondary" onClick={()=>backup({words:store.words,categories:store.categories,sessions:store.sessions,settings:store.settings})}><Download size={18}/>{pick('Экспорт JSON','Export JSON')}</button><button className="btn secondary" onClick={()=>file.current?.click()}><Upload size={18}/>{pick('Импорт JSON','Import JSON')}</button><input ref={file} hidden type="file" accept="application/json" onChange={load}/><button className="btn border" onClick={store.resetProgress}><RotateCcw size={18}/>{pick('Сбросить прогресс','Reset progress')}</button><button className="btn danger-action sm:col-span-2" onClick={store.clear}><Trash2 size={18}/>{pick('Удалить все данные','Delete all data')}</button></div>{message&&<p className="muted mt-4">{message}</p>}</section></div>;
}
