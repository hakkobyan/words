'use client';

import {useMemo, useState} from 'react';
import {ArrowRight, Check, Plus, Sparkles, X} from 'lucide-react';
import {useVocabularyStore} from '@/store/useVocabularyStore';
import {useI18n} from '@/lib/i18n';
import {Progress} from '@/components/ui/Parts';
import {isCorrectAnswer} from '@/lib/answers';
import {DailyCard, answersFor, pickDailyWords, promptFor} from '@/lib/dailyWords';

export default function DailyWords({onDone}: {onDone: () => void}) {
  const store = useVocabularyStore();
  const {pick} = useI18n();
  const language = store.settings.defaultLanguage;
  // Drawn once per mount, so the batch stays stable while the user works through it.
  const cards = useMemo(
    () => pickDailyWords(language, store.settings.learnerLevel, store.seenDailyIds, store.words),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState<'none' | 'right' | 'wrong'>('none');
  const [correct, setCorrect] = useState(0);
  const [added, setAdded] = useState<string[]>([]);

  const card: DailyCard | undefined = cards[index];
  // Russian needs two cases here: "с английского" but "на английский".
  const fromName = language === 'english' ? pick('английского', 'English') : pick('немецкого', 'German');
  const toName = language === 'english' ? pick('английский', 'English') : pick('немецкий', 'German');

  const finish = () => {
    store.markDailySeen(cards.map(c => c.entry.id));
    onDone();
  };

  if (cards.length === 0) {
    return (
      <Shell>
        <h1 className="text-2xl font-black">{pick('Слова закончились', 'No words left')}</h1>
        <p className="muted">{pick('Вы разобрали весь запас для своего уровня.', 'You have worked through the whole pool for your level.')}</p>
        <button className="btn primary w-full" onClick={onDone}>{pick('Продолжить', 'Continue')}</button>
      </Shell>
    );
  }

  if (!card) {
    return (
      <Shell>
        <span className="secondary inline-flex p-3 rounded-2xl"><Sparkles size={26} /></span>
        <h1 className="text-2xl font-black">{pick('Разминка окончена', 'Warm-up complete')}</h1>
        <p className="muted">
          {pick(`Угадано ${correct} из ${cards.length}.`, `Guessed ${correct} of ${cards.length}.`)}
          {added.length > 0 && ' ' + pick(`Добавлено в словарь: ${added.length}.`, `Added to your dictionary: ${added.length}.`)}
        </p>
        <button className="btn primary w-full" onClick={finish}>{pick('К приложению', 'Go to the app')}</button>
      </Shell>
    );
  }

  const check = () => {
    if (verdict !== 'none') return;
    const right = isCorrectAnswer(answer, answersFor(card));
    setVerdict(right ? 'right' : 'wrong');
    if (right) setCorrect(c => c + 1);
  };

  const next = () => {
    setIndex(i => i + 1);
    setAnswer('');
    setVerdict('none');
  };

  const addToDictionary = () => {
    const sessionId =
      store.sessions.find(s => s.language === language)?.id ??
      store.addSession(pick('Новые слова', 'New words'), language);
    store.addWord({
      language,
      word: card.entry.word,
      translationRu: card.entry.translationRu,
      categoryId: card.entry.categoryId,
      sessionId,
      cefrLevel: card.entry.level,
      favorite: false,
      learned: false,
      correctAnswers: 0,
      wrongAnswers: 0,
      difficulty: 'new',
    });
    setAdded(list => [...list, card.entry.id]);
  };

  const alreadyAdded = added.includes(card.entry.id);
  const expected = card.direction === 'toRu' ? card.entry.translationRu : card.entry.word;

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <span className="pill">{index + 1} / {cards.length}</span>
        <span className="pill">{card.entry.level}</span>
      </div>
      <Progress value={(index / cards.length) * 100} />

      <div className="text-center py-2">
        <p className="muted text-sm">
          {card.direction === 'toRu'
            ? pick(`Переведите с ${fromName} на русский`, `Translate into Russian`)
            : pick(`Переведите на ${toName}`, `Translate into ${toName}`)}
        </p>
        <p className="text-4xl font-black py-5">{promptFor(card)}</p>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          if (verdict === 'none') check();
          else next();
        }}
        className="space-y-4"
      >
        <input
          autoFocus
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          readOnly={verdict !== 'none'}
          placeholder={pick('Ваш перевод…', 'Your translation…')}
          className={verdict === 'right' ? 'answer-correct' : verdict === 'wrong' ? 'answer-wrong' : ''}
        />

        {verdict === 'right' && (
          <p className="flex items-center gap-2 font-bold" style={{color: 'var(--success)'}}>
            <Check size={18} />{pick('Верно!', 'Correct!')}
          </p>
        )}

        {verdict === 'wrong' && (
          <div className="space-y-3">
            <p className="flex items-center gap-2 font-bold" style={{color: 'var(--danger)'}}>
              <X size={18} />{pick('Правильный ответ:', 'Correct answer:')} {expected}
            </p>
            <button type="button" className="btn secondary w-full" onClick={addToDictionary} disabled={alreadyAdded}>
              {alreadyAdded ? <><Check size={18} />{pick('Добавлено в словарь', 'Added to dictionary')}</> : <><Plus size={18} />{pick('Добавить это слово в словарь', 'Add this word to my dictionary')}</>}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn" onClick={finish}>{pick('Пропустить разминку', 'Skip warm-up')}</button>
          {verdict === 'none'
            ? <button type="submit" className="btn primary">{pick('Проверить', 'Check')}</button>
            : <button type="submit" className="btn primary">{pick('Дальше', 'Next')} <ArrowRight size={18} /></button>}
        </div>
      </form>
    </Shell>
  );
}

function Shell({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'var(--paper)'}}>
      <div className="card w-full max-w-lg p-6 md:p-8 space-y-5">{children}</div>
    </div>
  );
}
