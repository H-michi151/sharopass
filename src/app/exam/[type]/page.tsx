'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '../../../stores/authStore';
import { useExamStore } from '../../../stores/examStore';
import { generateSentakuExam, generateTakuitsuExam } from '../../../lib/sampleData';
import ExamTimer from '../../../components/ExamTimer';
import QuestionNav from '../../../components/QuestionNav';
import TakuitsuQuestion from '../../../components/TakuitsuQuestion';
import SentakuQuestion from '../../../components/SentakuQuestion';
import { ExamType } from '../../../types';

export default function ExamPage() {
  const params = useParams();
  const type = params.type as ExamType;
  const router = useRouter();
  
  const { user } = useAuthStore();
  const { 
    questions, 
    session, 
    currentIndex, 
    results,
    isReviewMode,
    customTimeLimitSentaku,
    customTimeLimitTakuitsu,
    setQuestions, 
    startSession, 
    nextQuestion, 
    prevQuestion, 
    submitExam,
    setReviewMode,
  } = useExamStore();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!user) return;

    // 復習モードの場合: セッションが完了済みでも、そのまま問題表示（リダイレクトしない）
    if (isReviewMode && session && session.type === type && session.status === 'completed') {
      setIsInitializing(false);
      return;
    }
    
    // すでに同一タイプの進行中セッションが存在する場合は初期化をスキップ
    if (session && session.type === type && session.status === 'in_progress') {
      setIsInitializing(false);
      return;
    }

    // データ初期化（新規受験）
    const customLimit = type === 'sentaku' ? customTimeLimitSentaku * 60 : customTimeLimitTakuitsu * 60;
    const { exam, questions: qList } = type === 'sentaku' ? generateSentakuExam() : generateTakuitsuExam();
    setQuestions(qList);
    startSession(exam.id, user.uid, type, customLimit, exam.subjects);
    setIsInitializing(false);
  }, [type, user]);

  useEffect(() => {
    // 試験が完了したとき、復習モードでなければ結果ページへ遷移
    if (results && session?.status === 'completed' && !isInitializing && !isReviewMode) {
      router.push(`/result/${results.id}`);
    }
  }, [results, session?.status, router, isInitializing, isReviewMode]);

  const handleSubmit = useCallback(() => {
    submitExam();
  }, [submitExam]);

  const handleExitReview = () => {
    setReviewMode(false);
    router.push('/');
  };

  if (isInitializing || !session) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        color: 'var(--color-text-muted)' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid rgba(255,255,255,0.1)', 
            borderTopColor: 'var(--color-accent)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p>試験データを読み込み中...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        background: isReviewMode ? 'rgba(46, 204, 113, 0.1)' : 'var(--color-bg-card)', 
        borderBottom: `1px solid ${isReviewMode ? 'var(--color-success)' : 'var(--color-border)'}`,
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={isReviewMode ? handleExitReview : () => router.push('/')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--color-text-muted)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {type === 'sentaku' ? '選択式試験（午前）' : '択一式試験（午後）'}
          </h1>
          {isReviewMode && (
            <span style={{
              padding: '4px 12px',
              borderRadius: '100px',
              background: 'rgba(46, 204, 113, 0.2)',
              color: 'var(--color-success)',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid var(--color-success)'
            }}>
              📖 復習モード
            </span>
          )}
        </div>
        {!isReviewMode ? (
          <ExamTimer />
        ) : (
          <button className="btn btn-secondary" onClick={handleExitReview} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            復習を終了
          </button>
        )}
      </header>

      {/* Content */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        width: '100%', 
        padding: '32px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '40px',
        flex: 1
      }}>
        {/* Main Area */}
        <main>
          <div className="card" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              {currentQuestion && (
                type === 'takuitsu' 
                ? <TakuitsuQuestion question={currentQuestion} />
                : <SentakuQuestion question={currentQuestion} />
              )}
            </div>

            {/* Pagination */}
            <div style={{ 
              marginTop: '40px', 
              paddingTop: '24px', 
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button 
                className="btn btn-secondary"
                disabled={currentIndex === 0}
                onClick={prevQuestion}
                style={{ minWidth: '120px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                前の問題
              </button>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                {currentIndex + 1} / {questions.length}
              </span>
              <button 
                className="btn btn-primary"
                disabled={currentIndex === questions.length - 1}
                onClick={nextQuestion}
                style={{ minWidth: '120px' }}
              >
                次の問題
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside>
          <div style={{ position: 'sticky', top: '92px' }}>
            <QuestionNav onSubmit={isReviewMode ? undefined : handleSubmit} />
            {!isReviewMode && (
              <div style={{ marginTop: '24px', padding: '16px', borderRadius: 'var(--radius)', background: 'rgba(232, 160, 32, 0.05)', border: '1px dashed var(--color-border)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-accent)' }}>ショートカット</h4>
                <ul style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', listStyle: 'none', padding: 0 }}>
                  <li>・矢印キーで前後の問題へ</li>
                  <li>・1～5 キーで解答選択</li>
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
