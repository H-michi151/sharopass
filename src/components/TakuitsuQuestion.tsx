'use client';

import { Question } from '../types';
import { useExamStore } from '../stores/examStore';

interface TakuitsuQuestionProps {
  question: Question;
}

export default function TakuitsuQuestion({ question }: TakuitsuQuestionProps) {
  const session = useExamStore((s) => s.session);
  const answerQuestion = useExamStore((s) => s.answerQuestion);
  
  const currentAnswer = session?.answers[question.id]?.answer as string | undefined;
  const isCompleted = session?.status !== 'in_progress';

  const handleSelect = (choice: string, index: number) => {
    if (isCompleted) return;
    answerQuestion(question.id, String(index + 1));
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span className="badge badge-accent">問 {question.globalNumber}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{question.subjectName}</span>
          {isCompleted && (
            <span className="badge badge-success" style={{ marginLeft: 'auto' }}>解答確認モード</span>
          )}
        </div>
        <div style={{ 
          fontSize: '1.15rem', 
          fontWeight: 600, 
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
          background: 'var(--color-bg-elevated)',
          padding: '24px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {question.text}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {question.choices?.map((choice, index) => {
          const choiceNum = String(index + 1);
          const isSelected = currentAnswer === choiceNum;
          const isCorrect = isCompleted && choiceNum === question.correctAnswer;
          const isWrong = isCompleted && isSelected && choiceNum !== question.correctAnswer;

          return (
            <button
              key={index}
              onClick={() => handleSelect(choice, index)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '16px 20px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: isCorrect 
                  ? 'var(--color-success)' 
                  : isWrong 
                    ? 'var(--color-error)' 
                    : isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                background: isCorrect
                  ? 'rgba(46, 204, 113, 0.1)'
                  : isWrong
                    ? 'rgba(231, 76, 60, 0.1)'
                    : isSelected ? 'rgba(37,99,235,0.08)' : 'var(--color-bg-card)',
                textAlign: 'left',
                cursor: isCompleted ? 'default' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isCompleted && !isCorrect && !isSelected ? 0.6 : 1,
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: isCorrect 
                  ? 'var(--color-success)' 
                  : isWrong 
                    ? 'var(--color-error)'
                    : isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: isCorrect 
                  ? 'var(--color-success)' 
                  : isWrong 
                    ? 'var(--color-error)' 
                    : isSelected ? 'var(--color-accent)' : 'transparent',
                color: (isSelected || isCorrect || isWrong) ? 'white' : 'var(--color-text-muted)',
              }}>
                {choiceNum}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: (isSelected || isCorrect) ? 600 : 400,
                  color: (isSelected || isCorrect) ? 'var(--color-text)' : 'var(--color-text-muted)',
                  textAlign: 'left',
                  lineHeight: '1.5'
                }}>
                  {choice}
                </span>
                {isCompleted && (
                  <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                    {isSelected && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        background: isWrong ? 'var(--color-error)' : 'var(--color-success)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        選択
                      </span>
                    )}
                    {isCorrect && !isSelected && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        background: 'var(--color-success)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        正解
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {isCompleted && question.explanation && (
        <div style={{ 
          marginTop: '32px', 
          padding: '24px', 
          background: 'var(--color-bg-elevated)', 
          borderRadius: 'var(--radius)',
          borderLeft: '4px solid var(--color-success)',
          animation: 'slideInUp 0.5s ease-out'
        }}>
          <h4 style={{ color: 'var(--color-success)', marginBottom: '8px', fontSize: '1rem', fontWeight: 'bold' }}>
            解説
          </h4>
          <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text)', margin: 0 }}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
