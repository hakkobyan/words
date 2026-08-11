import {WordHuntLevel} from '@/types';
import {WORD_HUNT_SOURCE_DETAILS} from '@/data/wordHuntSourceDetails';
import {CEFR_VOCABULARY_BY_LEVEL} from '@/data/cefrVocabulary';

export type WordHuntTarget={
  id:string;word:string;translationRu:string;partOfSpeech:string;level:Exclude<WordHuntLevel,'mixed'>;definition:string;pronunciation:string;example:string;
  related:string[];neighbors:Record<string,number>;hints:[string,string,string];categoryId:string;
  cloze?:string;
  practice:{question:string;options:string[];correctIndex:number;explanation:string};
};

export const WORD_HUNT_TARGETS:WordHuntTarget[]=[
  {
    id:'family',word:'family',translationRu:'семья',partOfSpeech:'noun',level:'A1',pronunciation:'/ˈfæməli/',categoryId:'family',
    definition:'A group of people who are related to each other.',example:'My family eats dinner together every Sunday.',related:['mother','father','parents','children'],
    neighbors:{parents:8,mother:15,father:18,children:22,home:48,relative:31,people:95,friend:180,office:1200},
    hints:['This is a noun.','It includes parents, children, and relatives.','Starts with “f”.'],
    practice:{question:'Which sentence uses “family” correctly?',options:['My family lives nearby.','She family the window.','The soup tastes family.'],correctIndex:0,explanation:'“Family” is a noun for people who are related to one another.'},
  },
  {
    id:'happy',word:'happy',translationRu:'счастливый',partOfSpeech:'adjective',level:'A1',pronunciation:'/ˈhæpi/',categoryId:'emotions',
    definition:'Feeling or showing pleasure or joy.',example:'She felt happy after hearing the good news.',related:['glad','pleased','smile','joy'],
    neighbors:{glad:7,pleased:14,joy:21,smile:34,cheerful:27,good:88,sad:920,angry:1100},
    hints:['This is an adjective.','It describes a positive feeling.','Starts with “h”.'],
    practice:{question:'Which sentence uses “happy” correctly?',options:['They were happy to see us.','He happy the book.','The happy ran quickly.'],correctIndex:0,explanation:'“Happy” is an adjective describing a feeling of joy.'},
  },
  {
    id:'listen',word:'listen',translationRu:'слушать',partOfSpeech:'verb',level:'A1',pronunciation:'/ˈlɪsən/',categoryId:'verbs',
    definition:'To pay attention to a sound or to someone speaking.',example:'Please listen carefully to the instructions.',related:['hear','sound','music','attention'],
    neighbors:{hear:11,sound:29,music:38,attention:17,speak:66,voice:72,ignore:940,write:1300},
    hints:['This is a verb.','You do this with your ears.','Starts with “l”.'],
    practice:{question:'Which sentence uses “listen” correctly?',options:['Listen to this song.','The listen chair is blue.','She is a listen.'],correctIndex:0,explanation:'“Listen” is a verb meaning to pay attention to sound.'},
  },
  {
    id:'borrow',word:'borrow',translationRu:'брать взаймы',partOfSpeech:'verb',level:'A2',pronunciation:'/ˈbɒrəʊ/',categoryId:'verbs',
    definition:'To take and use something that belongs to someone else, then return it.',example:'Can I borrow your pen for a minute?',related:['lend','take','return','loan'],
    neighbors:{lend:9,loan:17,take:42,return:25,use:91,give:118,keep:760,buy:980},
    hints:['This is a verb.','You take something temporarily and return it later.','Starts with “b”.'],
    practice:{question:'Which sentence uses “borrow” correctly?',options:['May I borrow your umbrella?','She borrowed me her car.','The borrow was delicious.'],correctIndex:0,explanation:'You borrow something from someone and return it later.'},
  },
  {
    id:'quietly',word:'quietly',translationRu:'тихо',partOfSpeech:'adverb',level:'A2',pronunciation:'/ˈkwaɪətli/',categoryId:'other',
    definition:'In a way that makes little or no noise.',example:'The children entered the room quietly.',related:['silently','softly','calmly','gently'],
    neighbors:{silently:8,softly:16,calmly:33,gently:29,slowly:74,loudly:930,noisy:1180},
    hints:['This is an adverb.','It describes doing something with little noise.','Starts with “q”.'],
    practice:{question:'Which sentence uses “quietly” correctly?',options:['He closed the door quietly.','It was a quietly room.','Quietly is my favourite chair.'],correctIndex:0,explanation:'“Quietly” is an adverb describing how an action is done.'},
  },
  {
    id:'journey',word:'journey',translationRu:'путешествие',partOfSpeech:'noun',level:'A2',pronunciation:'/ˈdʒɜːni/',categoryId:'travel',
    definition:'An act of travelling from one place to another.',example:'The train journey took three hours.',related:['trip','travel','route','destination'],
    neighbors:{trip:7,travel:13,route:31,destination:38,voyage:22,train:86,stay:810,home:1050},
    hints:['This is a noun.','It is the experience of travelling from one place to another.','Starts with “j”.'],
    practice:{question:'Which sentence uses “journey” correctly?',options:['The journey across the mountains was long.','We journey the blue bag.','She feels very journey.'],correctIndex:0,explanation:'“Journey” is a noun for travel from one place to another.'},
  },
  {
    id:'achieve',word:'achieve',translationRu:'достигать',partOfSpeech:'verb',level:'B1',pronunciation:'/əˈtʃiːv/',categoryId:'verbs',
    definition:'To succeed in reaching a goal through effort.',example:'She worked hard to achieve her goal.',related:['accomplish','succeed','reach','attain'],
    neighbors:{accomplish:6,succeed:15,reach:24,attain:9,goal:42,complete:58,fail:910,lose:1200},
    hints:['This is a verb.','It means to successfully reach a goal.','Starts with “a”.'],
    practice:{question:'Which sentence uses “achieve” correctly?',options:['They achieved excellent results.','The achieve was on the shelf.','She is very achieve.'],correctIndex:0,explanation:'“Achieve” is a verb meaning to reach a desired result.'},
  },
  {
    id:'confident',word:'confident',translationRu:'уверенный',partOfSpeech:'adjective',level:'B1',pronunciation:'/ˈkɒnfɪdənt/',categoryId:'emotions',
    definition:'Feeling sure about your abilities or decisions.',example:'He felt confident before the interview.',related:['sure','positive','secure','self-assured'],
    neighbors:{sure:12,secure:27,positive:44,'self-assured':8,brave:69,calm:91,uncertain:880,nervous:1040},
    hints:['This is an adjective.','It describes someone who believes in their ability.','Starts with “c”.'],
    practice:{question:'Which sentence uses “confident” correctly?',options:['She is confident about the exam.','He confident the answer.','The confident is under the table.'],correctIndex:0,explanation:'“Confident” describes feeling sure about yourself or a result.'},
  },
  {
    id:'opportunity',word:'opportunity',translationRu:'возможность',partOfSpeech:'noun',level:'B1',pronunciation:'/ˌɒpəˈtjuːnəti/',categoryId:'other',
    definition:'A situation that makes it possible to do something useful or desirable.',example:'This course is a great opportunity to improve your English.',related:['chance','possibility','occasion','opening'],
    neighbors:{chance:7,possibility:18,opening:29,occasion:46,option:61,future:105,problem:870,barrier:1120},
    hints:['This is a noun.','It means a good chance to do something.','Starts with “o”.'],
    practice:{question:'Which sentence uses “opportunity” correctly?',options:['The job is a valuable opportunity.','She opportunity the letter.','The opportunity soup was hot.'],correctIndex:0,explanation:'“Opportunity” is a noun for a favourable chance to do something.'},
  },
  {
    id:'resilient',word:'resilient',translationRu:'жизнестойкий',partOfSpeech:'adjective',level:'C1',pronunciation:'/rɪˈzɪliənt/',categoryId:'adjectives',
    definition:'Able to recover quickly from difficulties.',example:'She remained resilient after a difficult year.',related:['strong','tough','persistent','determined'],
    neighbors:{strong:142,tough:47,persistent:12,determined:18,robust:28,adaptable:36,durable:55,recover:72,endure:91,brave:118,confident:205,fragile:890,happy:1842},
    hints:['This is an adjective.','Describes someone who can recover quickly from difficulties.','Starts with “r”.'],
    practice:{question:'Which sentence uses “resilient” correctly?',options:['The resilient table was made of wood.','She was resilient and recovered quickly after the setback.','He resilient the door.'],correctIndex:1,explanation:'“Resilient” describes a person or thing that recovers well after difficulty.'},
  },
  {
    id:'perceive',word:'perceive',translationRu:'воспринимать, замечать',partOfSpeech:'verb',level:'C1',pronunciation:'/pəˈsiːv/',categoryId:'verbs',
    definition:'To notice, understand, or interpret something in a particular way.',example:'People often perceive the same situation differently.',related:['notice','sense','interpret','recognize'],
    neighbors:{notice:14,sense:22,interpret:9,recognize:31,observe:44,understand:57,detect:68,realize:83,see:126,ignore:930,forget:1420},
    hints:['This is a verb.','It means to notice or understand something through the senses or mind.','Starts with “p”.'],
    practice:{question:'Which sentence uses “perceive” correctly?',options:['Children may perceive time differently from adults.','She perceive the blue quickly yesterday.','The perceive chair stood near the wall.'],correctIndex:0,explanation:'“Perceive” is a verb meaning to notice, understand, or interpret something.'},
  },
  {
    id:'insight',word:'insight',translationRu:'глубокое понимание',partOfSpeech:'noun',level:'B2',pronunciation:'/ˈɪnsaɪt/',categoryId:'school',
    definition:'A clear and deep understanding of a person, situation, or problem.',example:'The interview offered valuable insight into her creative process.',related:['understanding','awareness','perspective','discovery'],
    neighbors:{understanding:12,awareness:24,perspective:18,discovery:41,knowledge:53,wisdom:66,idea:104,analysis:128,confusion:990,ignorance:1360},
    hints:['This is a noun.','It means a deep and useful understanding of something.','Starts with “i”.'],
    practice:{question:'Which sentence uses “insight” correctly?',options:['The research gave us new insight into the problem.','She insight the report every morning.','The insight car was extremely fast.'],correctIndex:0,explanation:'“Insight” is a noun for a deep or useful understanding.'},
  },
  {
    id:'reluctantly',word:'reluctantly',translationRu:'неохотно',partOfSpeech:'adverb',level:'B2',pronunciation:'/rɪˈlʌktəntli/',categoryId:'emotions',
    definition:'In an unwilling or hesitant way.',example:'He reluctantly agreed to change the original plan.',related:['unwillingly','hesitantly','cautiously','grudgingly'],
    neighbors:{unwillingly:6,hesitantly:13,cautiously:39,grudgingly:9,slowly:86,doubtfully:54,agree:144,eagerly:880,willingly:1040},
    hints:['This is an adverb.','It describes doing something without really wanting to do it.','Starts with “r”.'],
    practice:{question:'Which sentence uses “reluctantly” correctly?',options:['She reluctantly accepted the difficult assignment.','The reluctantly book was on the table.','He became a reluctantly person.'],correctIndex:0,explanation:'“Reluctantly” is an adverb describing an action done unwillingly.'},
  },
  {
    id:'whereas',word:'whereas',translationRu:'тогда как',partOfSpeech:'conjunction',level:'B2',pronunciation:'/weərˈæz/',categoryId:'other',
    definition:'Used to contrast two facts, ideas, or situations.',example:'The first task was simple, whereas the second required careful planning.',related:['while','although','contrast','however'],
    neighbors:{while:11,although:26,contrast:17,however:34,but:58,unlike:71,comparison:96,similarly:850,because:1030},
    hints:['This is a conjunction.','It introduces a contrast between two facts or situations.','Starts with “w”.'],
    practice:{question:'Which sentence uses “whereas” correctly?',options:['Maya enjoys cities, whereas Leo prefers the countryside.','She whereas completed the project.','The whereas answer was correct.'],correctIndex:0,explanation:'“Whereas” is a conjunction used to contrast two different facts.'},
  },
];

function nounTarget(id:string,translationRu:string,level:Exclude<WordHuntLevel,'mixed'>,definition:string,example:string,related:[string,string,string,string],categoryId='other',cloze?:string):WordHuntTarget{
  const neighbors=Object.fromEntries(related.map((word,index)=>[word,[9,18,31,47][index]]));
  return {
    id,word:id,translationRu,partOfSpeech:'noun',level,pronunciation:'',categoryId,definition,example,cloze,related,neighbors:{...neighbors,thing:820,action:1260},
    hints:['This is a noun.',definition,`Starts with “${id[0]}”.`],
    practice:{question:`Which sentence uses “${id}” correctly?`,options:[example,`She ${id} the report yesterday.`,`They felt very ${id}.`],correctIndex:0,explanation:`“${id}” is used here as a noun.`},
  };
}

const EXTRA_NOUN_TARGETS:WordHuntTarget[]=[
  nounTarget('weather','погода','A1','The condition of the air outside, such as sun, rain, or wind.','The weather is warm and sunny today.',['rain','sun','wind','climate'],'nature'),
  nounTarget('village','деревня','A1','A small group of houses in the countryside.','Her family lives in a quiet village.',['town','countryside','community','home'],'home'),
  nounTarget('customer','клиент','A2','A person who buys goods or services.','The customer asked for a receipt.',['buyer','shopper','client','consumer'],'work'),
  nounTarget('luggage','багаж','A2','The bags and cases you take when travelling.','Our luggage is already on the train.',['bag','suitcase','baggage','travel'],'travel'),
  nounTarget('advice','совет','B1','An opinion about what someone should do.','Her advice helped me make a better choice.',['guidance','suggestion','recommendation','help'],'other'),
  nounTarget('decision','решение','B1','A choice made after thinking about several possibilities.','It was a difficult decision for the whole team.',['choice','judgment','conclusion','option'],'work'),
  nounTarget('evidence','доказательство','B2','Facts or information showing that something is true.','The report provides strong evidence for the claim.',['proof','fact','indication','testimony'],'school'),
  nounTarget('assumption','предположение','B2','Something accepted as true without definite proof.','The plan was based on a false assumption.',['belief','presumption','idea','expectation'],'school'),
  nounTarget('perspective','точка зрения','C1','A particular way of considering or understanding something.','The discussion gave us a different perspective.',['viewpoint','outlook','angle','standpoint'],'school'),
  nounTarget('resilience','жизнестойкость','C1','The ability to recover quickly from difficulty or change.','Her resilience helped her overcome the setback.',['strength','recovery','endurance','adaptability'],'emotions'),
  nounTarget('implication','последствие, подтекст','C1','A possible effect or meaning that is suggested rather than stated.','We discussed the wider implication of the decision.',['consequence','meaning','effect','suggestion'],'other'),
];

const importedTargets=(Object.entries(CEFR_VOCABULARY_BY_LEVEL) as [Exclude<WordHuntLevel,'mixed'>,typeof CEFR_VOCABULARY_BY_LEVEL.A1][]).flatMap(([level,entries])=>{
  const nouns=entries.filter(entry=>entry.partOfSpeech==='noun');
  return nouns.map((entry,index)=>{
    const related=[nouns[(index+1)%nouns.length].word,nouns[(index+2)%nouns.length].word,nouns[(index+3)%nouns.length].word,nouns[(index+4)%nouns.length].word] as [string,string,string,string];
    const source=WORD_HUNT_SOURCE_DETAILS[entry.word];
    return nounTarget(entry.word,entry.translationRu,level,`An English noun at ${level} level.`,source?.example??`This vocabulary lesson focuses on the noun “${entry.word}”.`,related,'other',source?.cloze);
  });
});

export const NOUN_HUNT_TARGETS=[...WORD_HUNT_TARGETS.filter(target=>target.partOfSpeech==='noun'),...EXTRA_NOUN_TARGETS,...importedTargets]
  .filter((target,index,items)=>items.findIndex(item=>item.id===target.id)===index);

export const getDailyHuntTargets=(level:WordHuntLevel='mixed',date=new Date())=>{
  const pool=level==='mixed'?NOUN_HUNT_TARGETS:NOUN_HUNT_TARGETS.filter(target=>target.level===level);
  const day=Math.floor(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())/86400000);
  const offset=day%pool.length;
  const rotated=[...pool.slice(offset),...pool.slice(0,offset)];
  return level==='mixed'?rotated.slice(0,5):rotated;
};
