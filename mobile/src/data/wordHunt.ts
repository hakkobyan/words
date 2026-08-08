export type WordHuntTarget={
  id:string;word:string;translationRu:string;partOfSpeech:string;definition:string;pronunciation:string;example:string;
  related:string[];neighbors:Record<string,number>;hints:[string,string,string];categoryId:string;
  practice:{question:string;options:string[];correctIndex:number;explanation:string};
};

export const WORD_HUNT_TARGETS:WordHuntTarget[]=[
  {
    id:'resilient',word:'resilient',translationRu:'жизнестойкий',partOfSpeech:'adjective',pronunciation:'/rɪˈzɪliənt/',categoryId:'adjectives',
    definition:'Able to recover quickly from difficulties.',example:'She remained resilient after a difficult year.',related:['strong','tough','persistent','determined'],
    neighbors:{strong:142,tough:47,persistent:12,determined:18,robust:28,adaptable:36,durable:55,recover:72,endure:91,brave:118,confident:205,fragile:890,happy:1842},
    hints:['This is an adjective.','Describes someone who can recover quickly from difficulties.','Starts with “r”.'],
    practice:{question:'Which sentence uses “resilient” correctly?',options:['The resilient table was made of wood.','She was resilient and recovered quickly after the setback.','He resilient the door.'],correctIndex:1,explanation:'“Resilient” describes a person or thing that recovers well after difficulty.'},
  },
  {
    id:'subtle',word:'subtle',translationRu:'тонкий, неявный',partOfSpeech:'adjective',pronunciation:'/ˈsʌtəl/',categoryId:'adjectives',
    definition:'Not obvious; delicate and difficult to notice.',example:'There was a subtle change in her tone.',related:['delicate','slight','nuanced','faint'],
    neighbors:{delicate:18,slight:25,nuanced:9,faint:34,quiet:71,gentle:82,hidden:95,indirect:116,small:185,obvious:980,loud:1510},
    hints:['This is an adjective.','Describes something delicate or not immediately obvious.','Starts with “s”.'],
    practice:{question:'Which sentence uses “subtle” correctly?',options:['The soup had a subtle hint of lemon.','She subtle the window.','The thunder was subtle and deafening.'],correctIndex:0,explanation:'A subtle hint is present but delicate and easy to miss.'},
  },
  {
    id:'awkward',word:'awkward',translationRu:'неловкий',partOfSpeech:'adjective',pronunciation:'/ˈɔːkwəd/',categoryId:'emotions',
    definition:'Uncomfortable, embarrassing, or difficult to handle.',example:'An awkward silence followed the question.',related:['uncomfortable','clumsy','embarrassing','uneasy'],
    neighbors:{uncomfortable:11,clumsy:19,embarrassing:27,uneasy:33,strange:66,difficult:91,shy:118,smooth:840,elegant:1200},
    hints:['This is an adjective.','It can describe an uncomfortable social moment.','Starts with “a”.'],
    practice:{question:'Which sentence uses “awkward” correctly?',options:['The conversation became awkward after the joke.','He awkward the bicycle.','The water tasted awkward.'],correctIndex:0,explanation:'“Awkward” naturally describes an uncomfortable conversation or situation.'},
  },
  {
    id:'overwhelming',word:'overwhelming',translationRu:'ошеломляющий',partOfSpeech:'adjective',pronunciation:'/ˌəʊvəˈwelmɪŋ/',categoryId:'emotions',
    definition:'Very intense or difficult to deal with.',example:'The amount of information felt overwhelming.',related:['intense','powerful','enormous','daunting'],
    neighbors:{intense:15,powerful:28,enormous:41,daunting:8,stressful:22,immense:37,difficult:74,busy:160,minor:1100,calm:1420},
    hints:['This is an adjective.','Describes something so intense that it is hard to manage.','Starts with “o”.'],
    practice:{question:'Which sentence uses “overwhelming” correctly?',options:['The overwhelming workload made it hard to focus.','She overwhelming the pen.','The tiny pause was overwhelming small.'],correctIndex:0,explanation:'A workload can feel overwhelming when it is too intense to manage easily.'},
  },
  {
    id:'inevitable',word:'inevitable',translationRu:'неизбежный',partOfSpeech:'adjective',pronunciation:'/ɪnˈevɪtəbəl/',categoryId:'adjectives',
    definition:'Certain to happen; impossible to avoid.',example:'Change is inevitable in a growing company.',related:['unavoidable','certain','destined','expected'],
    neighbors:{unavoidable:5,certain:21,destined:34,expected:48,necessary:76,likely:109,future:190,preventable:930,unlikely:1250},
    hints:['This is an adjective.','Describes something that cannot be avoided.','Starts with “i”.'],
    practice:{question:'Which sentence uses “inevitable” correctly?',options:['With dark clouds overhead, rain seemed inevitable.','He inevitable the meeting.','The chair was inevitable blue.'],correctIndex:0,explanation:'Rain is inevitable when it is certain to happen and cannot be avoided.'},
  },
];

export const getDailyHuntTargets=()=>WORD_HUNT_TARGETS;
