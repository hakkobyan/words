export type WordHuntTarget={
  id:string;word:string;translationRu:string;partOfSpeech:string;level:'B2'|'C1';definition:string;pronunciation:string;example:string;
  related:string[];neighbors:Record<string,number>;hints:[string,string,string];categoryId:string;
  practice:{question:string;options:string[];correctIndex:number;explanation:string};
};

export const WORD_HUNT_TARGETS:WordHuntTarget[]=[
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

export const getDailyHuntTargets=(level:'mixed'|'B2'|'C1'='mixed',date=new Date())=>{
  const pool=level==='mixed'?WORD_HUNT_TARGETS:WORD_HUNT_TARGETS.filter(target=>target.level===level);
  const day=Math.floor(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())/86400000);
  const offset=day%pool.length;
  return [...pool.slice(offset),...pool.slice(0,offset)];
};
