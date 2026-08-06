'use client';

import {useState} from 'react';
import {ClipboardList, Sparkles} from 'lucide-react';
import {useVocabularyStore} from '@/store/useVocabularyStore';
import {useI18n} from '@/lib/i18n';
import {LanguageSelector, Progress} from '@/components/ui/Parts';
import {levelTestWords, scoreToLevel} from '@/data/levelTest';
import {isCorrectAnswer} from '@/lib/answers';
import {dailySession} from '@/lib/dailyWords';
import {CEFR_LEVELS, CefrLevel, StudyLanguage} from '@/types';

const levelHints: Record<CefrLevel, [string, string]> = {
  A1: ['Начинающий', 'Beginner'],
  A2: ['Элементарный', 'Elementary'],
  B1: ['Средний', 'Intermediate'],
  B2: ['Выше среднего', 'Upper-intermediate'],
  C1: ['Продвинутый', 'Advanced'],
  C2: ['В совершенстве', 'Proficient'],
};

type Step = 'welcome' | 'method' | 'manual' | 'test' | 'result';

export default function Onboarding() {
  const setSettings = useVocabularyStore(s => s.setSettings);
  const {pick} = useI18n();
  const [step, setStep] = useState<Step>('welcome');
  const [language, setLanguage] = useState<StudyLanguage>('english');
  const [testIndex, setTestIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [resultLevel, setResultLevel] = useState<CefrLevel>('B1');

  const words = levelTestWords[language];

  const finish = (level: CefrLevel) => {
    // The level test already covered plenty of typing — start the daily warm-up next launch.
    dailySession.markHandled();
    setSettings({defaultLanguage: language, learnerLevel: level, onboardingCompleted: true});
  };

  const submitTestAnswer = () => {
    const correct = isCorrectAnswer(answer, words[testIndex].answers);
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    setAnswer('');
    if (testIndex + 1 < words.length) {
      setTestIndex(testIndex + 1);
    } else {
      setResultLevel(scoreToLevel(nextScore));
      setStep('result');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'var(--paper)'}}>
      <div className="card w-full max-w-lg p-6 md:p-8">
        {step === 'welcome' && (
          <div className="space-y-6">
            <span className="secondary inline-flex p-3 rounded-2xl"><Sparkles size={26} /></span>
            <h1 className="text-2xl md:text-3xl font-black">{pick('Добро пожаловать в words!', 'Welcome to words!')}</h1>
            <p className="muted">{pick('Какой язык вы учите?', 'Which language are you learning?')}</p>
            <LanguageSelector value={language} onChange={setLanguage} />
            <button className="btn primary w-full" onClick={() => setStep('method')}>
              {pick('Продолжить', 'Continue')}
            </button>
          </div>
        )}

        {step === 'method' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black">{pick('Ваш уровень', 'Your level')}</h1>
            <p className="muted">{pick('Как определим ваш уровень владения языком?', 'How should we work out your level?')}</p>
            <div className="grid gap-3">
              <button className="btn secondary justify-start p-5 h-auto text-left" onClick={() => setStep('test')}>
                <ClipboardList size={22} />
                <span>
                  <span className="block font-bold">{pick('Пройти тест', 'Take a test')}</span>
                  <span className="block muted text-sm font-normal">{pick('20 слов разных уровней — переведите их', '20 words of different levels — translate them')}</span>
                </span>
              </button>
              <button className="btn border justify-start p-5 h-auto text-left" onClick={() => setStep('manual')}>
                <Sparkles size={22} />
                <span>
                  <span className="block font-bold">{pick('Указать самому', 'Set it myself')}</span>
                  <span className="block muted text-sm font-normal">{pick('Я знаю свой уровень CEFR', 'I already know my CEFR level')}</span>
                </span>
              </button>
            </div>
          </div>
        )}

        {step === 'manual' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black">{pick('Выберите уровень', 'Choose your level')}</h1>
            <div className="grid grid-cols-2 gap-3">
              {CEFR_LEVELS.map(level => (
                <button key={level} className="btn border flex-col items-start gap-1 h-auto py-4" onClick={() => finish(level)}>
                  <span className="font-black text-xl">{level}</span>
                  <span className="muted text-xs font-normal">{pick(...levelHints[level])}</span>
                </button>
              ))}
            </div>
            <button className="btn w-full" onClick={() => setStep('method')}>{pick('Назад', 'Back')}</button>
          </div>
        )}

        {step === 'test' && (
          <form
            className="space-y-6"
            onSubmit={e => {
              e.preventDefault();
              submitTestAnswer();
            }}
          >
            <div className="flex items-center justify-between">
              <span className="pill">{testIndex + 1} / {words.length}</span>
              <span className="muted text-sm">{pick('Переведите слово на русский', 'Translate the word into Russian')}</span>
            </div>
            <Progress value={((testIndex) / words.length) * 100} />
            <p className="text-4xl font-black text-center py-6">{words[testIndex].word}</p>
            <input
              autoFocus
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder={pick('Ваш перевод…', 'Your translation…')}
            />
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="btn" onClick={submitTestAnswer}>{pick('Пропустить', 'Skip')}</button>
              <button type="submit" className="btn primary">{pick('Дальше', 'Next')}</button>
            </div>
          </form>
        )}

        {step === 'result' && (
          <div className="space-y-6 text-center">
            <span className="secondary inline-flex p-3 rounded-2xl"><Sparkles size={26} /></span>
            <h1 className="text-2xl font-black">{pick('Ваш уровень', 'Your level')}</h1>
            <p className="text-5xl font-black" style={{color: 'var(--green)'}}>{resultLevel}</p>
            <p className="muted">
              {pick(`Правильно: ${score} из ${words.length}. `, `Correct: ${score} of ${words.length}. `)}
              {pick(...levelHints[resultLevel])}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn" onClick={() => setStep('manual')}>{pick('Изменить', 'Change')}</button>
              <button className="btn primary" onClick={() => finish(resultLevel)}>{pick('Начать', 'Start')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
