import AsyncStorage from '@react-native-async-storage/async-storage';

const keys={words:'language_app_words_v1',categories:'language_app_categories_v1',sessions:'language_app_sessions_v1',settings:'language_app_settings_v1',meta:'language_app_meta_v1'};
export async function read<T>(key:keyof typeof keys,fallback:T):Promise<T>{try{const x=await AsyncStorage.getItem(keys[key]);return x?JSON.parse(x):fallback}catch{return fallback}}
export async function write<T>(key:keyof typeof keys,value:T){try{await AsyncStorage.setItem(keys[key],JSON.stringify(value))}catch{}}
export function backupPayload(data:Record<string,unknown>){return JSON.stringify({schemaVersion:1,exportDate:new Date().toISOString(),...data},null,2)}
export const storageKeys=keys;
