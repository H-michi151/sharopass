'use client';

import { useExamStore } from '../stores/examStore';

interface QuestionNavProps {
  onSubmit?: () => void;
}

export default function QuestionNav({ onSubmit }: QuestionNavProps) {
  const questions = useExamStore((s) => s.questions);
  const session = useExamStore((s) => s.session);
  const currentIndex = useExamStore((s) => s.currentIndex);
  const goToQuestion = useExamStore((s) => s.goToQuestion);

  const answeredCount = session ? Object.keys(session.answers).length : 0;
  const isAllAnswered = answeredCount === questions.length;

  const handleSubmit = () => {
    if (!onSubmit) return;
    if (!isAllAnswered) {
      if (window.confirm(`未解答の問題が ${questions.length - answeredCount} 問あります。このまま採点しますか？`)) {
        onSubmit();
      }
    } else {
      onSubmit();
    }
  };

  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius)',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      position: 'sticky',
      top: '20px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>進行状況</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--color-accent)', fontSize: '1.1rem' }}>{answeredCount}</span>
            <span style={{ color: 'var(--color-text-muted)', margin: '0 2px' }}>/</span>
            <span>{questions.length}</span>
          </span>
        </div>
        <div className="progress-bar" style={{ height: '8px', background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="progress-bar-fill"
            style={{ 
              width: `${(answeredCount / questions.length) * 100}%`,
              background: isAllAnswered ? 'var(--color-success)' : 'var(--color-accent)',
              boxShadow: `0 0 10px ${isAllAnswered ? 'rgba(46,204,113,0.3)' : 'rgba(232,160,32,0.3)'}`
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '24px'
      }}>
        {questions.map((q, i) => {
          const isAnswered = session && session.answers[q.id];
          const isCurrent = i === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(i)}
              style={{
                aspectRatio: '1/1',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: isCurrent ? 'var(--color-accent)' : (isAnswered ? 'rgba(46,204,113,0.3)' : 'transparent'),
                background: isCurrent ? 'rgba(var(--color-accent-rgb), 0.15)' : (isAnswered ? 'rgba(var(--color-success-rgb), 0.1)' : 'rgba(255,255,255,0.03)'),
                color: isCurrent ? 'var(--color-accent)' : (isAnswered ? 'var(--color-success)' : 'var(--color-text-muted)'),
                fontSize: '0.85rem',
                fontWeight: isCurrent || isAnswered ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {onSubmit && (
        <>
          <button
            className={`btn ${isAllAnswered ? 'btn-success' : 'btn-accent'}`}
            style={{ 
              width: '100%', 
              padding: '14px', 
              fontSize: '1rem', 
              fontWeight: 700,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              boxShadow: `0 4px 15px ${isAllAnswered ? 'rgba(46,204,113,0.2)' : 'rgba(232,160,32,0.2)'}`
            }}
            onClick={handleSubmit}
          >
            <span>{isAllAnswered ? '試験を終了する' : '途中採点して提出'}</span>
            {!isAllAnswered && (
              <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 500 }}>
                未解答 {questions.length - answeredCount} 問
              </span>
            )}
          </button>

          {!isAllAnswered && (
            <p style={{ 
              fontSize: '0.75rem', 
              color: 'var(--color-text-muted)', 
              textAlign: 'center', 
              marginTop: '12px',
              lineHeight: 1.4
            }}>
              ※ 時間切れになった場合も<br/>その時点の解答で採点されます。
            </p>
          )}
        </>
      )}
    </div>
  );
}
