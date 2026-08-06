import {CEFR_LEVELS,CefrLevel,StudyLanguage} from './types';

export type TranscriptCue={text:string;startSeconds:number};
export type VideoVocabularyItem={id:string;word:string;pronunciation:string;partOfSpeech:string;level:CefrLevel;translationRu:string;explanation:string;example:string;exampleTranslationRu:string;synonyms:string[];antonyms?:string[];categoryId:string;timestampSeconds:number};
export type VideoAnalysis={video:{id:string;title:string;url:string;durationSeconds:number;language:string;subtitleAvailability:'available'};vocabulary:VideoVocabularyItem[];transcriptWordCount:number};
type CatalogEntry=Omit<VideoVocabularyItem,'id'|'example'|'exampleTranslationRu'|'timestampSeconds'>&{variants?:string[]};

export const CEFR_RANK:Record<CefrLevel,number>=Object.fromEntries(CEFR_LEVELS.map((level,index)=>[level,index])) as Record<CefrLevel,number>;

const entry=(word:string,pronunciation:string,partOfSpeech:string,level:CefrLevel,translationRu:string,explanation:string,categoryId:string,synonyms:string[],antonyms?:string[],variants?:string[]):CatalogEntry=>({word,pronunciation,partOfSpeech,level,translationRu,explanation,categoryId,synonyms,antonyms,variants});

const englishCatalog:CatalogEntry[]=[
  entry('approach','/əˈprəʊtʃ/','Noun','B2','подход','a way of dealing with a task or problem','work',['method','strategy']),
  entry('achieve','/əˈtʃiːv/','Verb','B1','достигать','to successfully reach a goal','verbs',['accomplish','attain'],['fail'],['achieved','achieves','achieving']),
  entry('acquire','/əˈkwaɪə(r)/','Verb','C1','приобретать','to get or develop something through effort','verbs',['obtain','gain'],undefined,['acquired','acquires','acquiring']),
  entry('adapt','/əˈdæpt/','Verb','B2','адаптироваться','to change so that something works better in a new situation','verbs',['adjust','modify'],undefined,['adapted','adapts','adapting']),
  entry('advantage','/ədˈvɑːntɪdʒ/','Noun','B2','преимущество','something that gives you a better chance of success','work',['benefit','strength'],['disadvantage']),
  entry('analysis','/əˈnæləsɪs/','Noun','B2','анализ','a detailed examination to understand something','school',['examination','study']),
  entry('audience','/ˈɔːdiəns/','Noun','B2','аудитория','the people who watch, listen to, or read something','other',['viewers','listeners']),
  entry('challenge','/ˈtʃælɪndʒ/','Noun','B1','задача','a difficult situation that needs effort to solve','other',['difficulty','test']),
  entry('collaborate','/kəˈlæbəreɪt/','Verb','B2','сотрудничать','to work together with other people','work',['cooperate','partner'],undefined,['collaborated','collaborates','collaborating']),
  entry('community','/kəˈmjuːnəti/','Noun','B1','сообщество','a group of people connected by a place or interest','other',['group','society']),
  entry('complex','/ˈkɒmpleks/','Adjective','B2','сложный','having many connected parts and not easy to understand','adjectives',['complicated','detailed'],['simple']),
  entry('consequence','/ˈkɒnsɪkwəns/','Noun','C1','последствие','a result of an action or event','other',['result','effect']),
  entry('consumer','/kənˈsjuːmə(r)/','Noun','B2','потребитель','a person who buys or uses products and services','work',['customer','buyer']),
  entry('context','/ˈkɒntekst/','Noun','B2','контекст','the situation that helps explain a word or event','school',['background','setting']),
  entry('contribute','/kənˈtrɪbjuːt/','Verb','B2','вносить вклад','to help cause or improve something','verbs',['help','add'],undefined,['contributed','contributes','contributing']),
  entry('crucial','/ˈkruːʃl/','Adjective','B2','решающий','extremely important for a result','adjectives',['essential','vital'],['minor']),
  entry('decline','/dɪˈklaɪn/','Verb','B2','снижаться','to become smaller, weaker, or less important','verbs',['decrease','drop'],['rise'],['declined','declines','declining']),
  entry('demonstrate','/ˈdemənstreɪt/','Verb','B2','демонстрировать','to show something clearly with actions or evidence','verbs',['show','prove'],undefined,['demonstrated','demonstrates','demonstrating']),
  entry('develop','/dɪˈveləp/','Verb','B1','развивать','to grow or improve over time','verbs',['build','improve'],undefined,['developed','develops','developing']),
  entry('efficient','/ɪˈfɪʃnt/','Adjective','B2','эффективный','working well without wasting time or energy','adjectives',['productive','effective'],['wasteful']),
  entry('emerge','/ɪˈmɜːdʒ/','Verb','C1','появляться','to become known or start to exist','verbs',['appear','arise'],undefined,['emerged','emerges','emerging']),
  entry('enhance','/ɪnˈhɑːns/','Verb','C1','улучшать','to improve the quality or value of something','verbs',['improve','strengthen'],undefined,['enhanced','enhances','enhancing']),
  entry('entrepreneur','/ˌɒntrəprəˈnɜː(r)/','Noun','B2','предприниматель','someone who starts and owns a business','work',['founder','businessperson']),
  entry('environment','/ɪnˈvaɪrənmənt/','Noun','B1','окружающая среда','the conditions or place in which something exists','nature',['surroundings','setting']),
  entry('estimate','/ˈestɪmeɪt/','Verb','B2','оценивать','to make a careful guess using available information','verbs',['calculate','assess'],undefined,['estimated','estimates','estimating']),
  entry('evaluate','/ɪˈvæljueɪt/','Verb','C1','оценивать','to judge the quality or value of something','verbs',['assess','review'],undefined,['evaluated','evaluates','evaluating']),
  entry('evidence','/ˈevɪdəns/','Noun','B2','доказательство','facts that show whether something is true','school',['proof','support']),
  entry('feature','/ˈfiːtʃə(r)/','Noun','B1','функция','an important part or quality of something','tech',['function','element']),
  entry('flexible','/ˈfleksəbl/','Adjective','B2','гибкий','able to change or adapt easily','adjectives',['adaptable','versatile'],['rigid']),
  entry('framework','/ˈfreɪmwɜːk/','Noun','C1','структура','a basic system that supports an idea or activity','work',['structure','system']),
  entry('impact','/ˈɪmpækt/','Noun','B1','влияние','a strong effect on a person or situation','other',['effect','influence']),
  entry('implement','/ˈɪmplɪment/','Verb','B2','внедрять','to put a plan or decision into action','verbs',['apply','carry out'],undefined,['implemented','implements','implementing']),
  entry('innovation','/ˌɪnəˈveɪʃn/','Noun','B2','инновация','a new idea, method, or product','tech',['invention','advance']),
  entry('insight','/ˈɪnsaɪt/','Noun','C1','понимание','a clear and deep understanding of something','school',['understanding','awareness']),
  entry('investment','/ɪnˈvestmənt/','Noun','B2','инвестиция','money or effort put into something for a future benefit','work',['funding','capital']),
  entry('maintain','/meɪnˈteɪn/','Verb','B2','поддерживать','to keep something at the same level or condition','verbs',['preserve','sustain'],undefined,['maintained','maintains','maintaining']),
  entry('opportunity','/ˌɒpəˈtjuːnəti/','Noun','B1','возможность','a chance to do something useful or successful','other',['chance','possibility']),
  entry('perspective','/pəˈspektɪv/','Noun','B2','точка зрения','a particular way of thinking about something','other',['viewpoint','outlook']),
  entry('potential','/pəˈtenʃl/','Adjective','B2','потенциальный','possible and likely to develop in the future','adjectives',['possible','likely']),
  entry('priority','/praɪˈɒrəti/','Noun','B2','приоритет','the thing that is most important to deal with first','work',['importance','focus']),
  entry('process','/ˈprəʊses/','Noun','B1','процесс','a series of actions that produces a result','other',['procedure','method']),
  entry('productivity','/ˌprɒdʌkˈtɪvəti/','Noun','B2','продуктивность','the rate at which useful work is done','work',['efficiency','output']),
  entry('reliable','/rɪˈlaɪəbl/','Adjective','B2','надёжный','able to be trusted to work well','adjectives',['dependable','trustworthy'],['unreliable']),
  entry('research','/rɪˈsɜːtʃ/','Noun','B1','исследование','careful study to discover new facts','school',['study','investigation']),
  entry('resource','/rɪˈsɔːs/','Noun','B2','ресурс','a useful supply of money, time, materials, or people','work',['asset','supply']),
  entry('strategy','/ˈstrætədʒi/','Noun','B2','стратегия','a careful plan for reaching a goal','work',['plan','approach']),
  entry('sustainable','/səˈsteɪnəbl/','Adjective','B2','устойчивый','able to continue for a long time without harm','nature',['lasting','viable']),
  entry('technology','/tekˈnɒlədʒi/','Noun','B1','технология','scientific tools and methods used to solve problems','tech',['tech','innovation']),
  entry('transform','/trænsˈfɔːm/','Verb','C1','преобразовывать','to change something completely','verbs',['convert','reshape'],undefined,['transformed','transforms','transforming']),
  entry('trend','/trend/','Noun','B2','тенденция','a general direction in which something is changing','work',['pattern','movement']),
  entry('unique','/juˈniːk/','Adjective','B2','уникальный','being the only one of its kind','adjectives',['distinctive','special'],['ordinary']),
  entry('valuable','/ˈvæljuəbl/','Adjective','B2','ценный','worth a lot of money or useful in an important way','adjectives',['useful','important']),
];

const germanCatalog:CatalogEntry[]=[
  entry('Ansatz','/ˈanzats/','Noun','B2','подход','eine Art, mit einer Aufgabe oder einem Problem umzugehen','work',['Methode','Strategie']),
  entry('erreichen','/ɛɐ̯ˈʁaɪ̯çn̩/','Verb','B1','достигать','ein Ziel erfolgreich schaffen','verbs',['schaffen','erzielen'],undefined,['erreicht','erreichte','erreichten']),
  entry('erwerben','/ɛɐ̯ˈvɛʁbn̩/','Verb','C1','приобретать','etwas durch Arbeit oder Lernen bekommen','verbs',['bekommen','anschaffen'],undefined,['erwirbt','erwarb','erworben']),
  entry('anpassen','/ˈanpasn̩/','Verb','B2','адаптировать','etwas für eine neue Situation passend machen','verbs',['verändern','abstimmen'],undefined,['angepasst','passt','an']),
  entry('Vorteil','/ˈfoːɐ̯taɪ̯l/','Noun','B2','преимущество','etwas, das eine bessere Chance auf Erfolg gibt','work',['Nutzen','Pluspunkt']),
  entry('Analyse','/anaˈlyːzə/','Noun','B2','анализ','eine genaue Untersuchung, um etwas zu verstehen','school',['Untersuchung','Auswertung']),
  entry('Zielgruppe','/ˈtsiːlˌɡrʊpə/','Noun','B2','целевая аудитория','die Menschen, für die etwas gemacht ist','work',['Publikum','Kundschaft']),
  entry('Herausforderung','/hɛˈʁaʊ̯sfɔʁdərʊŋ/','Noun','B1','задача','eine schwierige Situation, die Einsatz braucht','other',['Aufgabe','Schwierigkeit']),
  entry('zusammenarbeiten','/tsuˈzamənˌaʁbaɪ̯tn̩/','Verb','B2','сотрудничать','mit anderen Menschen gemeinsam arbeiten','work',['kooperieren','mitarbeiten'],undefined,['zusammengearbeitet','arbeitet']),
  entry('komplex','/kɔmˈplɛks/','Adjective','B2','сложный','mit vielen Teilen und nicht leicht zu verstehen','adjectives',['kompliziert','vielschichtig'],['einfach']),
  entry('Kontext','/kɔnˈtɛkst/','Noun','B2','контекст','die Situation, die etwas erklärt','school',['Zusammenhang','Hintergrund']),
  entry('beitragen','/ˈbaɪ̯tʁaːɡn̩/','Verb','B2','вносить вклад','bei etwas helfen oder etwas verbessern','verbs',['helfen','mitwirken'],undefined,['beigetragen','trägt']),
  entry('entscheidend','/ɛntˈʃaɪ̯dənt/','Adjective','B2','решающий','für ein Ergebnis sehr wichtig','adjectives',['wichtig','wesentlich'],['unwichtig']),
  entry('nachweisen','/ˈnaːxvaɪ̯zn̩/','Verb','C1','доказывать','mit Fakten zeigen, dass etwas wahr ist','verbs',['belegen','zeigen'],undefined,['nachgewiesen','weist']),
  entry('entwickeln','/ɛntˈvɪkl̩n/','Verb','B1','развивать','über Zeit besser oder größer werden lassen','verbs',['aufbauen','verbessern'],undefined,['entwickelt','entwickelte']),
  entry('effizient','/efitsiˈɛnt/','Adjective','B2','эффективный','gut arbeiten, ohne Zeit oder Energie zu verschwenden','adjectives',['wirksam','produktiv'],['ineffizient']),
  entry('entstehen','/ɛntˈʃteːən/','Verb','B2','возникать','neu beginnen oder sichtbar werden','verbs',['auftreten','sich bilden'],undefined,['entstanden','entsteht']),
  entry('verbessern','/fɛɐ̯ˈbɛsɐn/','Verb','B1','улучшать','etwas besser machen','verbs',['optimieren','steigern'],undefined,['verbessert','verbesserte']),
  entry('Möglichkeit','/ˈmøːklɪçkaɪ̯t/','Noun','B1','возможность','eine Chance, etwas zu tun','other',['Chance','Option']),
  entry('Forschung','/ˈfɔʁʃʊŋ/','Noun','B1','исследование','genaues Studium, um neue Fakten zu finden','school',['Untersuchung','Studie']),
  entry('Ressource','/ʁeˈsʊʁsə/','Noun','B2','ресурс','ein nützlicher Vorrat an Zeit, Geld oder Material','work',['Mittel','Bestand']),
  entry('Strategie','/ʃtʁateˈɡiː/','Noun','B2','стратегия','ein genauer Plan für ein Ziel','work',['Plan','Vorgehen']),
  entry('nachhaltig','/ˈnaːxhaltɪç/','Adjective','B2','устойчивый','lange möglich, ohne Schaden zu verursachen','nature',['dauerhaft','umweltfreundlich']),
  entry('Technologie','/tɛçnoloˈɡiː/','Noun','B1','технология','wissenschaftliche Werkzeuge und Methoden für Probleme','tech',['Technik','Innovation']),
  entry('zuverlässig','/tsuˈfɛʁlɛsɪç/','Adjective','B2','надёжный','so, dass man darauf vertrauen kann','adjectives',['verlässlich','sicher'],['unzuverlässig']),
  entry('umsetzen','/ˈʊmzɛtsn̩/','Verb','B2','реализовывать','einen Plan wirklich machen','verbs',['verwirklichen','ausführen'],undefined,['umgesetzt','setzt']),
  entry('Einfluss','/ˈaɪ̯nflʊs/','Noun','B1','влияние','eine Wirkung auf Menschen oder Situationen','other',['Wirkung','Auswirkung']),
  entry('Potenzial','/potɛntsiˈaːl/','Noun','B2','потенциал','eine Fähigkeit, die sich in Zukunft entwickeln kann','other',['Möglichkeit','Chance']),
  entry('Priorität','/pʁioʁiˈtɛːt/','Noun','B2','приоритет','das Wichtigste, das zuerst behandelt wird','work',['Vorrang','Wichtigkeit']),
  entry('Prozess','/pʁoˈtsɛs/','Noun','B1','процесс','eine Reihe von Schritten mit einem Ergebnis','other',['Ablauf','Verfahren']),
  entry('Produktivität','/pʁodʊktiviˈtɛːt/','Noun','B2','продуктивность','wie viel nützliche Arbeit in einer Zeit entsteht','work',['Leistung','Effizienz']),
  entry('Funktion','/fʊŋkˈtsi̯oːn/','Noun','B1','функция','eine wichtige Aufgabe oder Eigenschaft','tech',['Aufgabe','Merkmal']),
  entry('innovativ','/ɪnovaˈtiːf/','Adjective','B2','инновационный','mit neuen und hilfreichen Ideen','tech',['neu','fortschrittlich']),
  entry('Perspektive','/pɛʁspɛkˈtiːvə/','Noun','B2','точка зрения','eine bestimmte Art, über etwas zu denken','other',['Sichtweise','Blickwinkel']),
];

const normalise=(value:string)=>value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}]+/gu,' ').trim();
const termsFor=(entry:CatalogEntry)=>[entry.word,...(entry.variants||[])].map(normalise);
const cueTokens=(cue:TranscriptCue)=>new Set(normalise(cue.text).split(' ').filter(Boolean));

export function parseYoutubeUrl(value:string){
  try{
    const url=new URL(value.trim());
    const host=url.hostname.replace(/^www\./,'').toLowerCase();
    let id='';
    if(host==='youtu.be')id=url.pathname.split('/').filter(Boolean)[0]||'';
    if(host.endsWith('youtube.com'))id=url.searchParams.get('v')||url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1]||'';
    return /^[\w-]{11}$/.test(id)?{id,url:`https://www.youtube.com/watch?v=${id}`} : null;
  }catch{return null}
}

export function formatDuration(seconds:number){const minutes=Math.floor(seconds/60),remaining=seconds%60;return `${minutes}:${String(remaining).padStart(2,'0')}`}
export function nextCefrLevel(level:CefrLevel){return CEFR_LEVELS[Math.min(CEFR_RANK[level]+1,CEFR_LEVELS.length-1)]}

export function curateTranscript(cues:TranscriptCue[],language:StudyLanguage){
  const catalog=language==='english'?englishCatalog:germanCatalog;
  const tokenized=cues.map(cue=>({cue,tokens:cueTokens(cue)}));
  return catalog.map(entry=>{
    const terms=termsFor(entry),matches=tokenized.filter(({tokens})=>terms.some(term=>tokens.has(term))),first=matches[0];
    if(!first)return null;
    return {...entry,id:`${language}:${normalise(entry.word)}`,example:first.cue.text.trim(),exampleTranslationRu:'',timestampSeconds:first.cue.startSeconds,occurrences:matches.length};
  }).filter((item):item is VideoVocabularyItem&{occurrences:number}=>Boolean(item)).sort((left,right)=>right.occurrences-left.occurrences||CEFR_RANK[right.level]-CEFR_RANK[left.level]||left.word.localeCompare(right.word)).slice(0,36).map(({occurrences,...item})=>item);
}
