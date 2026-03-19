'use client';

import { useState } from 'react';
import { Question } from '../types';
import { useExamStore } from '../stores/examStore';

interface SentakuQuestionProps {
  question: Question;
}

export default function SentakuQuestion({ question }: SentakuQuestionProps) {
  const session = useExamStore((s) => s.session);
  const answerQuestion = useExamStore((s) => s.answerQuestion);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number>(0);
  
  const currentAnswers = (session?.answers[question.id]?.answer as Record<string, string>) || {};
  const isCompleted = session?.status !== 'in_progress';

  const handleSelect = (blankId: string, value: string) => {
    if (isCompleted) return;
    const newAnswers = { ...currentAnswers, [blankId]: value };
    answerQuestion(question.id, newAnswers);
  };

  // 選択済みの空欄の解除
  const handleClearBlank = (blankId: string) => {
    if (isCompleted) return;
    const newAnswers = { ...currentAnswers };
    delete newAnswers[blankId];
    answerQuestion(question.id, newAnswers);
  };

  const blanks = question.blanks || [];
  const blankLabels = ['ア', 'イ', 'ウ', 'エ', 'オ'];
  const allChoices = blanks[0]?.choices || [];

  // 現在使用中の選択肢セット（本試験準拠：同一選択肢は1回のみ使用可）
  const usedChoices = new Set(Object.values(currentAnswers));

  const handleChoiceClick = (choice: string) => {
    if (isCompleted) return;
    // 他の空欄で使用済みの場合はクリック不可
    if (usedChoices.has(choice) && currentAnswers[blanks[activeBlankIndex]?.id] !== choice) return;
    if (activeBlankIndex < blanks.length) {
      handleSelect(blanks[activeBlankIndex].id, choice);
      if (activeBlankIndex < blanks.length - 1) {
        setActiveBlankIndex(activeBlankIndex + 1);
      }
    }
  };

  return (
    <div className="fade-in">
      {/* 問題文セクション */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-accent">問 {question.globalNumber}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{question.subjectName}</span>
          {question.tags?.map(tag => (
            <span key={tag} className="badge" style={{ fontSize: '0.7rem' }}>{tag}</span>
          ))}
          {isCompleted && (
            <span className="badge badge-success" style={{ marginLeft: 'auto' }}>解答確認モード</span>
          )}
        </div>
        <div style={{ 
          fontSize: '1.25rem', 
          lineHeight: 2, 
          whiteSpace: 'pre-wrap',
          background: 'rgba(255,255,255,0.05)',
          padding: '32px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
          color: '#fff'
        }}>
          {question.text}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
        {/* 空欄解答状況セクション */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            {isCompleted ? '採点結果' : '空欄を選択して解答してください'}
          </h4>
          {blanks.map((blank, index) => {
            const userAnswer = currentAnswers[blank.id];
            const isSelected = !!userAnswer;
            const isActive = activeBlankIndex === index;
            const isCorrect = isCompleted && userAnswer === blank.correctAnswer;
            const isWrong = isCompleted && isSelected && userAnswer !== blank.correctAnswer;

            return (
              <div key={blank.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={() => {
                    if (isCompleted) return;
                    if (activeBlankIndex === index && currentAnswers[blank.id]) {
                      // 既に選択中の空欄を再クリック → 解除
                      handleClearBlank(blank.id);
                    } else {
                      setActiveBlankIndex(index);
                    }
                  }}
                  title={currentAnswers[blank.id] ? 'もう一度クリックで解除' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    background: isCorrect 
                      ? 'rgba(var(--color-success-rgb), 0.15)' 
                      : isWrong 
                        ? 'rgba(var(--color-error-rgb), 0.15)'
                        : isActive ? 'rgba(var(--color-accent-rgb), 0.15)' : 'rgba(255,255,255,0.07)',
                    border: `2px solid ${
                      isCorrect ? 'var(--color-success)' : isWrong ? 'var(--color-error)' : isActive ? 'var(--color-accent)' : 'var(--color-border)'
                    }`,
                    borderRadius: '10px',
                    cursor: isCompleted ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <span style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    background: isCorrect ? 'var(--color-success)' : isWrong ? 'var(--color-error)' : (isActive ? 'var(--color-accent)' : 'var(--color-bg-light)'),
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '0.9rem',
                    marginRight: '14px',
                    fontWeight: 'bold'
                  }}>
                    {blankLabels[index]}
                  </span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ 
                      fontSize: '1.05rem', 
                      fontWeight: 600,
                      color: isSelected ? '#fff' : 'var(--color-text-muted)',
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {userAnswer || '未選択'}
                    </div>
                    {isCompleted && (
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        {isCorrect ? (
                          <span style={{ color: 'var(--color-success)' }}>✓ 正解</span>
                        ) : (
                          <span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>
                            {isSelected ? '✗ 不正解' : '⚠ 未解答'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
                {isCompleted && !isCorrect && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-success)', padding: '4px 12px', fontWeight: 'bold' }}>
                    正解：{blank.correctAnswer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 選択肢一覧セクション */}
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>選択肢一覧</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '10px',
            background: 'rgba(0,0,0,0.3)',
            padding: '20px',
            borderRadius: 'var(--radius)',
            border: '2px solid var(--color-border)'
          }}>
            {allChoices.map((choice, i) => {
              const num = i + 1;
              // この選択肢が現在のアクティブな空欄で選択されているか
              const activeBlankId = blanks[activeBlankIndex]?.id;
              const isActiveBlankChoice = currentAnswers[activeBlankId] === choice;
              // 他の空欄で使用中か（本試験準拠：再使用不可）
              const usedByOtherBlank = usedChoices.has(choice) && !isActiveBlankChoice;
              const isUsed = usedChoices.has(choice);
              
              return (
                <button
                  key={i}
                  onClick={() => handleChoiceClick(choice)}
                  className="btn"
                  disabled={isCompleted || usedByOtherBlank}
                  title={usedByOtherBlank ? '他の空欄で使用中（本試験準拠：1回のみ使用可）' : undefined}
                  style={{
                    justifyContent: 'flex-start',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    height: 'auto',
                    minHeight: '48px',
                    background: isActiveBlankChoice
                      ? 'rgba(var(--color-accent-rgb), 0.25)'
                      : usedByOtherBlank ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
                    opacity: usedByOtherBlank ? 0.35 : 1,
                    border: isActiveBlankChoice
                      ? '1px solid var(--color-accent)'
                      : usedByOtherBlank ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: usedByOtherBlank ? 'var(--color-text-muted)' : '#eee',
                    cursor: isCompleted || usedByOtherBlank ? 'not-allowed' : 'pointer',
                    textDecoration: usedByOtherBlank ? 'line-through' : 'none',
                  }}
                >
                  <span style={{
                    color: usedByOtherBlank ? 'var(--color-text-muted)' : 'var(--color-accent)',
                    fontWeight: 'bold', minWidth: '24px', fontSize: '0.9rem'
                  }}>{num}</span>
                  <span style={{ flex: 1 }}>{choice}</span>
                  {isUsed && !usedByOtherBlank && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 'bold' }}>✓選択中</span>
                  )}
                  {usedByOtherBlank && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>使用済</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isCompleted && question.explanation && (
        <div style={{ 
          marginTop: '32px', 
          padding: '24px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: 'var(--radius)',
          borderLeft: '4px solid var(--color-success)',
          animation: 'slideInUp 0.5s ease-out'
        }}>
          <h4 style={{ color: 'var(--color-success)', marginBottom: '8px', fontSize: '1rem', fontWeight: 'bold' }}>
            解説
          </h4>
          <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#eee', margin: 0 }}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
