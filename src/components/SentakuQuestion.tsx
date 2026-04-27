'use client';

import { Question } from '../types';
import { useExamStore } from '../stores/examStore';

interface SentakuQuestionProps {
  question: Question;
}

const blankLabels = ['ア', 'イ', 'ウ', 'エ', 'オ'];
const blankColors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function SentakuQuestion({ question }: SentakuQuestionProps) {
  const session = useExamStore((s) => s.session);
  const answerQuestion = useExamStore((s) => s.answerQuestion);

  const currentAnswers = (session?.answers[question.id]?.answer as Record<string, string>) || {};
  const isCompleted = session?.status !== 'in_progress';

  const sentakuData = question.sentakuData;
  const blanks: string[] = sentakuData?.blanks || blankLabels;
  const allChoices: string[] = sentakuData?.choices || [];

  // 重複防止付きのonChange handler
  const handleChange = (blankId: string, value: string) => {
    if (isCompleted) return;
    const newAnswers = { ...currentAnswers };
    if (value === '') {
      delete newAnswers[blankId];
    } else {
      // 他の空欄で同じ値が使われていたら先に解除する
      Object.keys(newAnswers).forEach(key => {
        if (key !== blankId && newAnswers[key] === value) {
          delete newAnswers[key];
        }
      });
      newAnswers[blankId] = value;
    }
    answerQuestion(question.id, newAnswers);
  };

  const getExpectedAnswer = (blankId: string, index: number): string => {
    if (sentakuData?.answers) return sentakuData.answers[blankId] ?? '';
    if (question.blanks) return question.blanks[index]?.correctAnswer ?? '';
    return '';
  };

  const answeredCount = Object.keys(currentAnswers).length;

  // ── 選択肢一覧（参照用）カード
  const choicesCard = (
    <div className="card sentaku-choices-card" style={{ padding: '20px' }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '12px' }}>
        ▼ 選択肢一覧（参照用）
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px 12px',
      }}>
        {/* sentakuData.choices の全件を表示（スライスなし） */}
        {allChoices.map((choice, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            fontSize: '0.82rem',
            color: 'var(--color-text)',
            lineHeight: 1.5,
            padding: '4px 6px',
            borderRadius: '6px',
            background: 'var(--color-bg-elevated)',
          }}>
            <span style={{
              minWidth: '22px', fontWeight: 700,
              color: 'var(--color-text-muted)',
              flexShrink: 0,
            }}>
              {i + 1}.
            </span>
            <span style={{ wordBreak: 'break-all' }}>{choice}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── プルダウン回答欄カード
  const answerCard = (
    <div className="card sentaku-answer-card" style={{ padding: '20px' }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '14px' }}>
        ▼ 回答欄（空欄ごとに選択）
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {blanks.map((blankId, index) => {
          const userAnswer = currentAnswers[blankId];
          const expected = getExpectedAnswer(blankId, index);
          const isCorrect = isCompleted ? userAnswer === expected : null;
          const color = blankColors[index] ?? '#888';

          return (
            <div key={blankId} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: isCompleted
                ? `1.5px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'}`
                : '1.5px solid var(--color-border)',
              background: isCompleted
                ? isCorrect ? 'rgba(22,163,74,0.07)' : 'rgba(220,38,38,0.07)'
                : 'var(--color-bg-card)',
            }}>
              {/* 空欄ラベル */}
              <span style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: color, color: '#fff',
                display: 'grid', placeItems: 'center',
                fontSize: '0.9rem', fontWeight: 800, flexShrink: 0,
              }}>
                {blankLabels[index]}
              </span>

              {/* select */}
              <select
                value={userAnswer ?? ''}
                disabled={isCompleted}
                onChange={(e) => handleChange(blankId, e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${color}60`,
                  background: 'var(--color-bg-elevated)',
                  color: userAnswer ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontSize: '0.88rem',
                  fontWeight: userAnswer ? 600 : 400,
                  outline: 'none',
                  cursor: isCompleted ? 'default' : 'pointer',
                  minWidth: 0,
                }}
              >
                <option value="">-- 選択してください --</option>
                {allChoices.map((choice, i) => (
                  <option key={i} value={choice}>{choice}</option>
                ))}
              </select>

              {/* 正誤バッジ（完了時） */}
              {isCompleted && (
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                  color: isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                }}>
                  {isCorrect ? '✓' : '✗'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 正解一覧（完了時） */}
      {isCompleted && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            ▼ 正解一覧
          </p>
          {blanks.map((blankId, index) => {
            const userAnswer = currentAnswers[blankId];
            const expected = getExpectedAnswer(blankId, index);
            const isCorrect = userAnswer === expected;
            return (
              <div key={blankId} style={{
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
              }}>
                <span style={{ fontWeight: 800, color: blankColors[index], minWidth: '20px', flexShrink: 0 }}>
                  {blankLabels[index]}
                </span>
                <span style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
                  正解: {expected}
                </span>
                {!isCorrect && userAnswer && (
                  <span style={{ color: 'var(--color-text-muted)' }}>（あなた: {userAnswer}）</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ fontFamily: 'inherit' }} className="fade-in">
      {/* ── ヘッダー ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <span className="badge badge-accent">問 {question.globalNumber}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{question.subjectName}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          {answeredCount}/{blanks.length} 解答済み
        </span>
        {isCompleted && (
          <span className="badge badge-success">解答確認モード</span>
        )}
      </div>

      {/*
        ── レイアウト ──
        PC (≥768px):  [問題文 60%] | [回答欄 + 選択肢 40%]  → 2カラム grid
        SP (<768px):  縦1列: 問題文 → 選択肢 → 回答欄
        CSS orderでSP時の表示順を制御する
      */}
      <div className="sentaku-layout" style={{ display: 'grid', gap: '16px' }}>

        {/* A: 問題文 — PC: col1, SP: order 1 */}
        <div className="card sentaku-question-card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            ▼ 問題文
          </p>
          <div style={{
            fontSize: '0.93rem',
            lineHeight: 1.9,
            whiteSpace: 'pre-wrap',
            color: 'var(--color-text)',
          }}>
            {question.text}
          </div>
        </div>

        {/* B: 選択肢一覧 — PC: col2 row1, SP: order 2 */}
        <div className="sentaku-choices-wrapper">
          {choicesCard}
        </div>

        {/* C: 回答欄 — PC: col2 row2, SP: order 3 */}
        <div className="sentaku-answer-wrapper">
          {answerCard}
          {/* 解説（完了時） */}
          {isCompleted && question.explanation && (
            <div style={{
              marginTop: '16px',
              padding: '20px',
              background: 'var(--color-bg-elevated)',
              borderRadius: 'var(--radius)',
              borderLeft: '4px solid var(--color-success)',
            }}>
              <h4 style={{ color: 'var(--color-success)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
                解説
              </h4>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--color-text)', margin: 0 }}>
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── レスポンシブCSS ── */}
      <style>{`
        /* スマホ: 縦1列、問題文 → 選択肢 → 回答欄 */
        .sentaku-layout {
          grid-template-columns: 1fr;
        }
        .sentaku-question-card { order: 1; }
        .sentaku-choices-wrapper { order: 2; }
        .sentaku-answer-wrapper  { order: 3; }

        /* PC: 2カラム
           col1 = 問題文（row 1〜2 stretch）
           col2 = 選択肢 (row1) + 回答欄 (row2)
        */
        @media (min-width: 768px) {
          .sentaku-layout {
            grid-template-columns: 60% 1fr;
            grid-template-rows: auto auto;
          }
          .sentaku-question-card {
            grid-column: 1;
            grid-row: 1 / 3;
            order: unset;
          }
          .sentaku-choices-wrapper {
            grid-column: 2;
            grid-row: 1;
            order: unset;
          }
          .sentaku-answer-wrapper {
            grid-column: 2;
            grid-row: 2;
            order: unset;
          }
        }
      `}</style>
    </div>
  );
}
