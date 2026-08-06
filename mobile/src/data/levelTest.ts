import {CefrLevel,StudyLanguage} from '@/types';

export interface LevelTestWord{word:string;level:CefrLevel;answers:string[]}

const english:LevelTestWord[]=[
  {word:'cat',level:'A1',answers:['кошка','кот']},
  {word:'house',level:'A1',answers:['дом']},
  {word:'water',level:'A1',answers:['вода']},
  {word:'weather',level:'A2',answers:['погода']},
  {word:'friend',level:'A2',answers:['друг','подруга']},
  {word:'already',level:'A2',answers:['уже']},
  {word:'experience',level:'B1',answers:['опыт']},
  {word:'environment',level:'B1',answers:['окружающая среда','среда']},
  {word:'achieve',level:'B1',answers:['достигать','достичь']},
  {word:'opportunity',level:'B1',answers:['возможность']},
  {word:'consequence',level:'B2',answers:['последствие']},
  {word:'reluctant',level:'B2',answers:['неохотный','нежелающий']},
  {word:'ambiguous',level:'B2',answers:['неоднозначный','двусмысленный']},
  {word:'sustainable',level:'B2',answers:['устойчивый']},
  {word:'meticulous',level:'C1',answers:['дотошный','скрупулёзный','тщательный']},
  {word:'ubiquitous',level:'C1',answers:['вездесущий','повсеместный']},
  {word:'discrepancy',level:'C1',answers:['несоответствие','расхождение']},
  {word:'ephemeral',level:'C2',answers:['эфемерный','мимолётный']},
  {word:'equanimity',level:'C2',answers:['невозмутимость','хладнокровие','спокойствие']},
  {word:'obfuscate',level:'C2',answers:['запутывать','затемнять','затуманивать']},
];

const german:LevelTestWord[]=[
  {word:'Katze',level:'A1',answers:['кошка','кот']},
  {word:'Haus',level:'A1',answers:['дом']},
  {word:'Wasser',level:'A1',answers:['вода']},
  {word:'Wetter',level:'A2',answers:['погода']},
  {word:'Freund',level:'A2',answers:['друг']},
  {word:'schon',level:'A2',answers:['уже']},
  {word:'Erfahrung',level:'B1',answers:['опыт']},
  {word:'Umwelt',level:'B1',answers:['окружающая среда','среда']},
  {word:'erreichen',level:'B1',answers:['достигать','достичь']},
  {word:'Gelegenheit',level:'B1',answers:['возможность','случай']},
  {word:'Folge',level:'B2',answers:['последствие']},
  {word:'zögerlich',level:'B2',answers:['неохотный','нерешительный']},
  {word:'zweideutig',level:'B2',answers:['неоднозначный','двусмысленный']},
  {word:'nachhaltig',level:'B2',answers:['устойчивый']},
  {word:'akribisch',level:'C1',answers:['дотошный','скрупулёзный','тщательный']},
  {word:'allgegenwärtig',level:'C1',answers:['вездесущий','повсеместный']},
  {word:'Diskrepanz',level:'C1',answers:['несоответствие','расхождение']},
  {word:'flüchtig',level:'C2',answers:['эфемерный','мимолётный','быстротечный']},
  {word:'Gelassenheit',level:'C2',answers:['невозмутимость','спокойствие','хладнокровие']},
  {word:'verschleiern',level:'C2',answers:['запутывать','скрывать','затемнять']},
];

export const levelTestWords:Record<StudyLanguage,LevelTestWord[]>={english,german};

export function scoreToLevel(score:number):CefrLevel{
  if(score<=3)return 'A1';
  if(score<=6)return 'A2';
  if(score<=10)return 'B1';
  if(score<=14)return 'B2';
  if(score<=17)return 'C1';
  return 'C2';
}
