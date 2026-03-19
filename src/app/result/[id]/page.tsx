'use client';

import { useParams, useRouter } from 'next/navigation';
import { useExamStore } from '../../../stores/examStore';
import { useAuthStore } from '../../../stores/authStore';
import { useStudyHistoryStore } from '../../../stores/studyHistoryStore';
import { useEffect } from 'react';

export default function ResultPage() {
  const { results, resetExam, setReviewMode, questions, session } = useExamStore();
  const { user } = useAuthStore();
  const { addRecord } = useStudyHistoryStore();
  const router = useRouter();

  useEffect(() => {
    if (!results) {
      router.push('/');
      return;
    }
    // 試験完了時に履歴を保存（重複防止：results.idで管理）
    if (results && session && questions.length > 0) {
      addRecord(results, questions, session.answers as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!results) router.push('/');
  }, [results, router]);

  if (!results || !user) return null;

  const handleReturn = () => {
    resetExam();
    router.push('/');
  };

  const handleReview = () => {
    setReviewMode(true);
    router.push(`/exam/${results.type}`);
  };

  const handleAnalytics = () => {
    resetExam();
    router.push('/analytics');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }} className="fade-in">
        <h1 style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          試験結果
        </h1>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            fontSize: '5rem', 
            fontWeight: 800, 
            lineHeight: 1,
            color: results.isPassing ? 'var(--color-success)' : 'var(--color-error)'
          }}>
            {results.totalScore}
            <span style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
              / {results.maxTotalScore} 点
            </span>
          </div>
          <div style={{
            padding: '8px 24px',
            borderRadius: '100px',
            fontSize: '1.2rem',
            fontWeight: 700,
            background: results.isPassing ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
            color: results.isPassing ? 'var(--color-success)' : 'var(--color-error)',
            border: `1px solid ${results.isPassing ? 'var(--color-success)' : 'var(--color-error)'}`
          }}>
            {results.isPassing ? '合 格' : '不合格'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }} className="fade-in">
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>得点率</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{results.totalPercentage}%</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>偏差値 (推定)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>{results.deviation}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>経過時間</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatTime(results.timeTaken)}</div>
        </div>
      </div>

      <div className="fade-in" style={{ animationDelay: '0.2s' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>科目別詳細</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '48px' }}>
          {results.subjectResults.map((r) => (
            <div key={r.subjectId} className="card" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '16px 24px' 
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{r.subjectName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="progress-bar" style={{ width: '120px' }}>
                    <div className="progress-bar-fill" style={{ width: `${r.percentage}%`, background: r.isPassing ? 'var(--color-success)' : 'var(--color-error)' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {r.score}問正解 / {r.maxScore}問中
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 700,
                  color: r.isPassing ? 'var(--color-success)' : 'var(--color-error)'
                }}>
                  {r.isPassing ? '突破' : '足切り'}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  基準点: {r.passingScore}点
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        textAlign: 'center', 
        display: 'flex', 
        gap: '16px', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button className="btn btn-secondary" onClick={handleReturn} style={{ minWidth: '160px' }}>
          トップに戻る
        </button>
        <button className="btn btn-primary" onClick={handleReview} style={{ minWidth: '160px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          問題を復習する
        </button>
        <button className="btn" onClick={handleAnalytics} style={{ 
          minWidth: '160px',
          background: 'rgba(52, 152, 219, 0.15)',
          border: '1px solid rgba(52, 152, 219, 0.4)',
          color: 'var(--color-info)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          学習分析を見る
        </button>
      </div>
    </main>
  );
}
