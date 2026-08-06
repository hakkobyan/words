import {useVocabularyStore} from '@/store/useVocabularyStore';

const copy={
 ru:{home:'Главная',words:'Слова',add:'Добавить',study:'Учить',more:'Ещё',categories:'Категории',sessions:'Сеансы',settings:'Настройки',localOnly:'Всё хранится только на этом устройстве',studyLanguage:'Язык обучения',english:'Английский',german:'Немецкий',searchWords:'Поиск слов',searchPlaceholder:'Найти слово или перевод…',done:'Готово'},
 en:{home:'Home',words:'Words',add:'Add',study:'Study',more:'More',categories:'Categories',sessions:'Sessions',settings:'Settings',localOnly:'Everything is stored only on this device',studyLanguage:'Learning language',english:'English',german:'German',searchWords:'Search words',searchPlaceholder:'Find a word or translation…',done:'Done'}
} as const;
export type CopyKey=keyof typeof copy.ru;
export function useI18n(){const language=useVocabularyStore(s=>s.settings.interfaceLanguage);const locale:'ru'|'en'=language==='en'?'en':'ru';return {locale,t:(key:CopyKey)=>copy[locale][key],pick:<T,>(ru:T,en:T)=>locale==='en'?en:ru}}
export function categoryLabel(id:string,fallback:string,locale:'ru'|'en'){
 const labels:Record<string,[string,string]>={animals:['Животные','Animals'],food:['Еда','Food'],family:['Семья','Family'],home:['Дом','Home'],work:['Работа','Work'],school:['Школа','School'],travel:['Путешествия','Travel'],transport:['Транспорт','Transport'],clothes:['Одежда','Clothes'],colors:['Цвета','Colors'],numbers:['Числа','Numbers'],time:['Время','Time'],nature:['Природа','Nature'],health:['Здоровье','Health'],sport:['Спорт','Sport'],tech:['Технологии','Technology'],city:['Город','City'],shopping:['Покупки','Shopping'],emotions:['Эмоции','Emotions'],verbs:['Глаголы','Verbs'],adjectives:['Прилагательные','Adjectives'],other:['Другое','Other']};
 return labels[id]?.[locale==='en'?1:0]??fallback;
}
