'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_STUDY_SUBJECTS, generateSubjectStudy, SENTAKU_POOLS, TAKUITSU_POOLS } from '../../lib/sampleData';
import { Question } from '../../types';

type Phase = 'select' | 'studying' | 'review';

const TAKUITSU_IDS = ['t1','t2','t3','t4','t5','t6','t7'];

function ExplanationBox({ explanation }: { explanation: string }) {
  return (
    <div style={{
      background: 'rgba(232,160,32,0.08)',
      border: '1px solid rgba(232,160,32,0.25)',
      borderRadius: '10px',
      padding: '16px 20px',
      marginTop: '12px',
    }}>
      <div style={{ fontWeight: 700, color: 'var(--color-accent)', marginBottom: '8px', fontSize: '0.88rem' }}>
        📝 解説
      </div>
      <p style={{ fontSize: '0.87rem', lineHeight: 1.85, color: 'var(--color-text)', margin: 0, whiteSpace: 'pre-wrap' }}>
        {explanation}
      </p>
    </div>
  );
}

export default function StudyPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // 選択肢の選択状態（問題ごとに保存）
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [currentSelected, setCurrentSelected] = useState<string | null>(null);

  const currentSubject = ALL_STUDY_SUBJECTS.find(s => s.id === selectedSubjectId);
  const currentQ = questions[currentIdx];
  const isTakuitsu = currentQ?.type === 'takuitsu';

  // 科目リスト
  const takuitsuSubjects = ALL_STUDY_SUBJECTS.filter(s => TAKUITSU_IDS.includes(s.id));
  const sentakuSubjects = ALL_STUDY_SUBJECTS.filter(s => !TAKUITSU_IDS.includes(s.id));

  // 科目のプールサイズを取得
  const getPoolSize = (id: string): number => {
    const isTakuitsuId = TAKUITSU_IDS.includes(id);
    const pool = isTakuitsuId
      ? (TAKUITSU_POOLS as Record<string, unknown[]>)[id]
      : (SENTAKU_POOLS as Record<string, unknown[]>)[id];
    return pool?.length || 1;
  };

  const handleStart = () => {
    if (!selectedSubjectId) return;
    const maxPool = getPoolSize(selectedSubjectId);
    const actualCount = Math.min(questionCount, maxPool);
    const { questions: qs } = generateSubjectStudy(selectedSubjectId, actualCount);
    if (qs.length === 0) return;
    setQuestions(qs);
    setCurrentIdx(0);
    setUserAnswers(new Array(qs.length).fill(null));
    setCurrentSelected(null);
    setPhase('studying');
  };

  const handleSelect = (choice: string) => {
    setCurrentSelected(choice);
  };

  const handleNext = () => {
    // 現在の回答を保存
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = currentSelected;
    setUserAnswers(newAnswers);

    if (currentIdx >= questions.length - 1) {
      setPhase('review');
    } else {
      setCurrentIdx(i => i + 1);
      setCurrentSelected(null);
    }
  };

  const handleRestart = () => {
    setPhase('select');
    setSelectedSubjectId('');
    setQuestions([]);
    setCurrentIdx(0);
    setUserAnswers([]);
    setCurrentSelected(null);
  };

  // ── 科目選択フェーズ ──
  if (phase === 'select') {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>📚 科目別学習</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              全問回答後にまとめて答え合わせ・解説を確認できます。
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => router.push('/')}>← 戻る</button>
        </div>

        {/* 択一式 */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-info)', marginBottom: '14px' }}>
            択一式（5択問題）
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {takuitsuSubjects.map(s => {
              const poolSize = getPoolSize(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSubjectId(s.id); setQuestionCount(Math.min(5, poolSize)); }}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    border: `2px solid ${selectedSubjectId === s.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: selectedSubjectId === s.id ? 'rgba(232,160,32,0.1)' : 'var(--color-bg-elevated)',
                    padding: '16px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>択一式</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: selectedSubjectId === s.id ? 'var(--color-accent)' : 'var(--color-text)', lineHeight: 1.4 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>プール: {poolSize}問</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 選択式 */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '14px' }}>
            選択式（空欄補充問題）
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {sentakuSubjects.map(s => {
              const poolSize = getPoolSize(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSubjectId(s.id); setQuestionCount(Math.min(3, poolSize)); }}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    border: `2px solid ${selectedSubjectId === s.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: selectedSubjectId === s.id ? 'rgba(232,160,32,0.1)' : 'var(--color-bg-elevated)',
                    padding: '16px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>選択式</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: selectedSubjectId === s.id ? 'var(--color-accent)' : 'var(--color-text)', lineHeight: 1.4 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>プール: {poolSize}問</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 問題数設定 */}
        {selectedSubjectId && (
          <div className="card fade-in" style={{ padding: '20px 24px', marginBottom: '24px' }}>
            <div style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>
              ✅ {ALL_STUDY_SUBJECTS.find(s => s.id === selectedSubjectId)?.name}
            </div>
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '10px' }}>
              出題数（最大{getPoolSize(selectedSubjectId)}問）：
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[3, 5, 7, 10].filter(n => n <= getPoolSize(selectedSubjectId)).map(n => (
                <button key={n} onClick={() => setQuestionCount(n)} className="btn" style={{
                  padding: '8px 18px',
                  background: questionCount === n ? 'rgba(232,160,32,0.2)' : 'var(--color-bg-elevated)',
                  border: `1px solid ${questionCount === n ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: questionCount === n ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontWeight: questionCount === n ? 700 : 400,
                }}>
                  {n}問
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleStart}
          disabled={!selectedSubjectId}
          style={{ width: '100%', opacity: selectedSubjectId ? 1 : 0.4 }}
        >
          学習を開始する →
        </button>
      </main>
    );
  }

  // ── 解答フェーズ ──
  if (phase === 'studying' && currentQ) {
    const choices = currentQ.choices || [];
    const progress = Math.round((currentIdx / questions.length) * 100);

    return (
      <main style={{ maxWidth: '780px', margin: '0 auto', padding: '40px 24px' }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{currentQ.subjectName}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>
              問題 {currentIdx + 1} / {questions.length}
            </div>
          </div>
          <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={() => { if(confirm('学習を終了しますか？')) handleRestart(); }}>
            終了
          </button>
        </div>

        {/* プログレスバー */}
        <div className="progress-bar" style={{ marginBottom: '24px' }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%`, background: 'var(--color-accent)', transition: 'width 0.4s ease' }} />
        </div>

        {/* 択一式問題 */}
        {isTakuitsu && (
          <div className="card fade-in" style={{ padding: '24px', marginBottom: '20px' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.85, marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
              {currentQ.text}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {choices.map((choice, idx) => {
                const isSelected = currentSelected === choice;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(choice)}
                    style={{
                      padding: '14px 18px',
                      background: isSelected ? 'rgba(232,160,32,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: '8px',
                      color: isSelected ? 'var(--color-accent)' : 'var(--color-text)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <span style={{ flexShrink: 0, minWidth: '22px', fontWeight: 700 }}>{idx + 1}.</span>
                    <span>{choice}</span>
                    {isSelected && <span style={{ marginLeft: 'auto', flexShrink: 0 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 選択式問題 */}
        {!isTakuitsu && currentQ.blanks && (
          <div className="card fade-in" style={{ padding: '24px', marginBottom: '20px' }}>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.85, marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
              {currentQ.text}
            </p>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '10px', fontWeight: 600 }}>
                選択肢（答え合わせで正誤を確認できます）：
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currentQ.blanks[0]?.choices.slice(0, 15).map((c, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.85rem' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              💡 頭の中で（ア）〜（オ）の答えを考えてください。解説は答え合わせで確認できます。
            </div>
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={isTakuitsu && !currentSelected}
          style={{ width: '100%', opacity: (isTakuitsu && !currentSelected) ? 0.4 : 1 }}
        >
          {currentIdx < questions.length - 1
            ? (isTakuitsu ? (currentSelected ? '次の問題へ →' : '選択肢を選んでください') : '次の問題へ →')
            : '答え合わせをする →'}
        </button>
      </main>
    );
  }

  // ── 答え合わせフェーズ ──
  if (phase === 'review') {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (q.type === 'takuitsu') {
        const correctChoiceIdx = parseInt(q.correctAnswer || '1') - 1;
        const correctChoice = q.choices?.[correctChoiceIdx];
        if (userAnswers[i] === correctChoice) correctCount++;
      }
      // 選択式はマーク不可のためカウント対象外（択一式のみカウント）
    });
    const takuitsuCount = questions.filter(q => q.type === 'takuitsu').length;
    const pct = takuitsuCount > 0 ? Math.round((correctCount / takuitsuCount) * 100) : 0;

    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        {/* 結果サマリー */}
        <div className="card fade-in" style={{ padding: '24px', marginBottom: '28px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>答え合わせ</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>{currentSubject?.name}</p>
          {takuitsuCount > 0 && (
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'flex-end', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, color: pct >= 60 ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {correctCount}
                  <span style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/{takuitsuCount}</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent)', marginTop: '4px' }}>{pct}%</div>
              </div>
            </div>
          )}
        </div>

        {/* 問題別答え合わせ */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          問題別の解説
        </h2>

        {questions.map((q, i) => {
          const correctChoiceIdx = parseInt(q.correctAnswer || '1') - 1;
          const correctChoice = q.choices?.[correctChoiceIdx];
          const isCorrect = q.type === 'takuitsu' ? userAnswers[i] === correctChoice : null; // 選択式はnull

          return (
            <div key={q.id} className="card fade-in" style={{
              padding: '20px 24px',
              marginBottom: '16px',
              borderLeft: `3px solid ${isCorrect === true ? 'var(--color-success)' : isCorrect === false ? 'var(--color-error)' : 'var(--color-accent)'}`,
              animationDelay: `${i * 0.05}s`,
            }}>
              {/* 問題番号・正誤バッジ */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                  問題 {i + 1}
                </span>
                {isCorrect === true && (
                  <span style={{ background: 'rgba(46,204,113,0.2)', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.85rem', padding: '3px 12px', borderRadius: '100px' }}>
                    ⭕ 正解
                  </span>
                )}
                {isCorrect === false && (
                  <span style={{ background: 'rgba(231,76,60,0.2)', color: 'var(--color-error)', fontWeight: 700, fontSize: '0.85rem', padding: '3px 12px', borderRadius: '100px' }}>
                    ❌ 不正解
                  </span>
                )}
                {isCorrect === null && (
                  <span style={{ background: 'rgba(232,160,32,0.2)', color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem', padding: '3px 12px', borderRadius: '100px' }}>
                    選択式
                  </span>
                )}
              </div>

              {/* 問題文（全文） */}
              <p style={{ fontSize: '0.88rem', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                {q.text}
              </p>

              {/* 択一式：回答と正答 */}
              {q.type === 'takuitsu' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ background: isCorrect ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem' }}>
                    <div style={{ color: 'var(--color-text-muted)', marginBottom: '4px', fontSize: '0.75rem' }}>あなたの回答</div>
                    <div style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600, lineHeight: 1.5 }}>
                      {userAnswers[i]
                        ? `${(q.choices || []).indexOf(userAnswers[i]!) + 1}. ${userAnswers[i]}`
                        : '未回答'}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(46,204,113,0.08)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem' }}>
                    <div style={{ color: 'var(--color-text-muted)', marginBottom: '4px', fontSize: '0.75rem' }}>正解</div>
                    <div style={{ color: 'var(--color-success)', fontWeight: 600, lineHeight: 1.5 }}>
                      {correctChoiceIdx + 1}. {correctChoice}
                    </div>
                  </div>
                </div>
              )}

              {/* 選択式：正答一覧 */}
              {q.type === 'sentaku' && q.blanks && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>正答：</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {q.blanks.map((b, bi) => (
                      <span key={bi} style={{ background: 'rgba(46,204,113,0.15)', border: '1px solid var(--color-success)', borderRadius: '6px', padding: '3px 10px', fontSize: '0.82rem', color: 'var(--color-success)', fontWeight: 600 }}>
                        （{['ア','イ','ウ','エ','オ'][bi]}）{b.correctAnswer}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <ExplanationBox explanation={q.explanation || '解説なし'} />
            </div>
          );
        })}

        {/* ボタン */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={handleStart}>同じ科目でもう一度</button>
          <button className="btn btn-secondary" onClick={handleRestart}>科目を変える</button>
          <button className="btn btn-secondary" onClick={() => router.push('/')}>ダッシュボードへ</button>
        </div>
      </main>
    );
  }

  return null;
}
