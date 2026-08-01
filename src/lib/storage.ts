const keys={words:'language_app_words_v1',categories:'language_app_categories_v1',sessions:'language_app_sessions_v1',settings:'language_app_settings_v1',meta:'language_app_meta_v1'};
export function read<T>(key:keyof typeof keys,fallback:T):T{if(typeof window==='undefined')return fallback;try{const x=localStorage.getItem(keys[key]);return x?JSON.parse(x):fallback}catch{return fallback}}
export function write<T>(key:keyof typeof keys,value:T){if(typeof window!=='undefined')localStorage.setItem(keys[key],JSON.stringify(value))}
export function backup(data:Record<string,unknown>){const blob=new Blob([JSON.stringify({schemaVersion:1,exportDate:new Date().toISOString(),...data},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`vocabulary-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}
export const storageKeys=keys;
