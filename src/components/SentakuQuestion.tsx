'use client';

import { useState, useEffect } from 'react';
import { Question } from '../types';
import { useExamStore } from '../stores/examStore';

interface SentakuQuestionProps {
  question: Question;
}

const blankThemeColors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
const blankLabels = ['ア', 'イ', 'ウ', 'エ', 'オ'];

export default function SentakuQuestion({ question }: SentakuQuestionProps) {
  const session = useExamStore((s) => s.session);
  const answerQuestion = useExamStore((s) => s.answerQuestion);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number>(0);

  // 問題が切り替わったら「ア」（index 0）からスタート
  useEffect(() => {
    setActiveBlankIndex(0);
  }, [question.id]);

  const currentAnswers = (session?.answers[question.id]?.answer as Record<string, string>) || {};
  const isCompleted = session?.status !== 'in_progress';

  const sentakuData = question.sentakuData;
  const blanks = sentakuData?.blanks || question.blanks?.map(b => b.id) || ['ア', 'イ', 'ウ', 'エ', 'オ'];
  const allChoices = sentakuData?.choices || question.blanks?.[0]?.choices || [];
  const usedChoices = new Set(Object.values(currentAnswers));

  const handleSelect = (blankId: string, value: string) => {
    if (isCompleted) return;
    const newAnswers = { ...currentAnswers, [blankId]: value };
    answerQuestion(question.id, newAnswers);
  };

  const handleClearBlank = (blankId: string) => {
    if (isCompleted) return;
    const newAnswers = { ...currentAnswers };
    delete newAnswers[blankId];
    answerQuestion(question.id, newAnswers);
  };

  const handleChoiceClick = (choice: string) => {
    if (isCompleted) return;
    const currentActiveBlankId = blanks[activeBlankIndex];
    if (usedChoices.has(choice) && currentAnswers[currentActiveBlankId] !== choice) return;
    if (activeBlankIndex < blanks.length) {
      handleSelect(currentActiveBlankId, choice);
      if (activeBlankIndex < blanks.length - 1) {
        setActiveBlankIndex(activeBlankIndex + 1);
      }
    }
  };

  const getExpectedAnswer = (blankId: string, index: number): string => {
    if (sentakuData?.answers) return sentakuData.answers[blankId] ?? '';
    if (question.blanks) return question.blanks[index]?.correctAnswer ?? '';
    return '';
  };

  const answeredCount = Object.keys(currentAnswers).length;
  const totalBlanks = blanks.length;

  return (
    <div className="sentaku-wrapper fade-in">
      {/* ── ヘッダー ── */}
      <div className="sentaku-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-accent">問 {question.globalNumber}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{question.subjectName}</span>
          {isCompleted && (
            <span className="badge badge-success" style={{ marginLeft: 'auto' }}>解答確認モード</span>
          )}
        </div>
        {/* 空欄進捗バー */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            {blanks.map((blankId, index) => {
              const userAnswer = currentAnswers[blankId];
              const isActive = activeBlankIndex === index;
              const color = blankThemeColors[index];
              return (
                <button
                  key={blankId}
                  onClick={() => {
                    if (isCompleted) return;
                    if (isActive && userAnswer) handleClearBlank(blankId);
                    else setActiveBlankIndex(index);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: `2px solid ${isActive ? color : userAnswer ? color : 'var(--color-border)'}`,
                    background: isActive ? `${color}20` : userAnswer ? `${color}10` : 'var(--color-bg-card)',
                    cursor: isCompleted ? 'default' : 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    color: isActive ? color : userAnswer ? color : 'var(--color-text-muted)',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? `0 0 0 3px ${color}25` : 'none',
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 800 }}>{blankLabels[index]}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: userAnswer ? 'var(--color-text)' : 'var(--color-text-muted)',
                  }}>
                    {userAnswer || '未選択'}
                  </span>
                  {isCompleted && (() => {
                    const expected = getExpectedAnswer(blankId, index);
                    const isCorrect = userAnswer === expected;
                    return (
                      <span style={{ fontSize: '0.6rem', color: isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {isCorrect ? '✓正解' : '✗不正解'}
                      </span>
                    );
                  })()}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
            {answeredCount}/{totalBlanks} 解答済み
          </div>
        </div>
      </div>

      {/* ── 問題文 ── */}
      <div className="sentaku-body">
        <div className="sentaku-question-text">
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px', fontWeight: 700 }}>
            ▼ 問題文（スクロールして読んでください）
          </p>
          <div style={{
            fontSize: '0.97rem',
            lineHeight: 1.9,
            whiteSpace: 'pre-wrap',
            color: 'var(--color-text)',
          }}>
            {question.text}
          </div>
        </div>

        {/* ── 解答欄（完了時の詳細） */}
        {isCompleted && (
          <div className="sentaku-answer-detail">
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '10px' }}>▼ 採点結果</p>
            {blanks.map((blankId, index) => {
              const userAnswer = currentAnswers[blankId];
              const expected = getExpectedAnswer(blankId, index);
              const isCorrect = userAnswer === expected;
              const color = blankThemeColors[index];
              return (
                <div key={blankId} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  marginBottom: '8px',
                  background: isCorrect ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                  border: `1.5px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'}`,
                }}>
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: color, color: '#fff', display: 'grid', placeItems: 'center',
                    fontSize: '0.9rem', fontWeight: 800, flexShrink: 0
                  }}>{blankLabels[index]}</span>
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <div>
                      あなたの解答：<strong style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {userAnswer || '（未解答）'}
                      </strong>
                      {isCorrect
                        ? <span style={{ color: 'var(--color-success)', marginLeft: '6px' }}>✓ 正解</span>
                        : <span style={{ color: 'var(--color-error)', marginLeft: '6px' }}>✗ 不正解</span>
                      }
                    </div>
                    {!isCorrect && (
                      <div style={{ marginTop: '4px', color: 'var(--color-success)' }}>
                        正解：<strong>{expected}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 選択肢 ── */}
      {!isCompleted && (
        <div className="sentaku-choices">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: blankThemeColors[activeBlankIndex], color: '#fff',
              display: 'grid', placeItems: 'center', fontSize: '0.9rem', fontWeight: 800,
              flexShrink: 0,
            }}>{blankLabels[activeBlankIndex]}</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
              （{blankLabels[activeBlankIndex]}）の選択肢を選んでください
            </p>
          </div>
          <div className="choices-grid-sentaku">
            {allChoices.map((choice, i) => {
              const activeBlankId = blanks[activeBlankIndex];
              const isActiveBlankChoice = currentAnswers[activeBlankId] === choice;
              const usedByOther = usedChoices.has(choice) && !isActiveBlankChoice;
              let usedBlankLabel = '';
              if (usedByOther) {
                const found = Object.entries(currentAnswers).find(([, c]) => c === choice);
                if (found) {
                  const idx = blanks.indexOf(found[0]);
                  usedBlankLabel = idx >= 0 ? blankLabels[idx] : found[0];
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => handleChoiceClick(choice)}
                  disabled={usedByOther}
                  title={usedByOther ? `（${usedBlankLabel}）で使用中` : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: isActiveBlankChoice
                      ? `2px solid ${blankThemeColors[activeBlankIndex]}`
                      : '1.5px solid var(--color-border)',
                    background: isActiveBlankChoice
                      ? `${blankThemeColors[activeBlankIndex]}15`
                      : 'var(--color-bg-card)',
                    opacity: usedByOther ? 0.4 : 1,
                    cursor: usedByOther ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: isActiveBlankChoice ? 700 : 500,
                    color: usedByOther ? 'var(--color-text-muted)' : 'var(--color-text)',
                    transition: 'all 0.15s',
                    textDecoration: usedByOther ? 'line-through' : 'none',
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: isActiveBlankChoice ? blankThemeColors[activeBlankIndex] : 'var(--color-bg-elevated)',
                    color: isActiveBlankChoice ? '#fff' : 'var(--color-text-muted)',
                    display: 'grid', placeItems: 'center',
                    fontSize: '0.72rem', fontWeight: 700, flexShrink: 0
                  }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{choice}</span>
                  {isActiveBlankChoice && (
                    <span style={{ fontSize: '0.7rem', color: blankThemeColors[activeBlankIndex], fontWeight: 800, flexShrink: 0 }}>✓</span>
                  )}
                  {usedByOther && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{usedBlankLabel}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 解説 ── */}
      {isCompleted && question.explanation && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius)',
          borderLeft: '4px solid var(--color-success)',
        }}>
          <h4 style={{ color: 'var(--color-success)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>解説</h4>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--color-text)', margin: 0 }}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
