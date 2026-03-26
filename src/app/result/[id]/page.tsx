'use client';

import { useParams, useRouter } from 'next/navigation';
import { useExamStore } from '../../../stores/examStore';
import { useAuthStore } from '../../../stores/authStore';
import { useStudyHistoryStore } from '../../../stores/studyHistoryStore';
import { useEffect } from 'react';

// A～F の評価関数
function getGrade(percentage: number): { grade: string; label: string; color: string; bg: string } {
  if (percentage >= 90) return { grade: 'A+', label: '優秀', color: '#00c896', bg: 'rgba(0,200,150,0.15)' };
  if (percentage >= 80) return { grade: 'A',  label: '優秀', color: '#2ecc71', bg: 'rgba(46,204,113,0.15)' };
  if (percentage >= 70) return { grade: 'B',  label: '良好', color: '#3498db', bg: 'rgba(52,152,219,0.15)' };
  if (percentage >= 60) return { grade: 'C',  label: '合格圏', color: '#f39c12', bg: 'rgba(243,156,18,0.15)' };
  if (percentage >= 50) return { grade: 'D',  label: '要努力', color: '#e67e22', bg: 'rgba(230,126,34,0.15)' };
  if (percentage >= 40) return { grade: 'E',  label: '不足', color: '#e74c3c', bg: 'rgba(231,76,60,0.15)' };
  return                       { grade: 'F',  label: '要再学習', color: '#c0392b', bg: 'rgba(192,57,43,0.15)' };
}

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
    if (results && session && questions.length > 0) {
      addRecord(results, questions, session.answers as any, user?.uid);
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

  const overall = getGrade(results.totalPercentage);

  // 得意・苦手科目の分析
  const sorted = [...results.subjectResults].sort((a, b) => b.percentage - a.percentage);
  const topSubjects = sorted.slice(0, 2);
  const weakSubjects = sorted.slice(-2).reverse();

  // 足切り科目
  const failedSubjects = results.subjectResults.filter(r => !r.isPassing);
  const passedSubjects = results.subjectResults.filter(r => r.isPassing);

  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 20px' }}>

      {/* ── ヘッダー：グレード表示 ── */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }} className="fade-in">
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px', letterSpacing: '0.1em' }}>
          {results.type === 'sentaku' ? '選択式' : '択一式'} 試験結果
        </p>

        {/* グレードバッジ */}
        <div style={{
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
          background: overall.bg, border: `2px solid ${overall.color}`,
          borderRadius: '16px', padding: '24px 48px', marginBottom: '20px'
        }}>
          <div style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, color: overall.color }}>
            {overall.grade}
          </div>
          <div style={{ fontSize: '1rem', color: overall.color, fontWeight: 600, marginTop: '4px' }}>
            {overall.label}
          </div>
        </div>

        {/* スコア */}
        <div>
          <span style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--color-text)' }}>
            {results.totalScore}
          </span>
          <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', margin: '0 8px' }}>
            / {results.maxTotalScore} 点
          </span>
          <span style={{
            fontSize: '1.4rem', fontWeight: 700,
            color: results.totalPercentage >= 60 ? 'var(--color-success)' : 'var(--color-text-muted)'
          }}>
            ({results.totalPercentage}%)
          </span>
        </div>
      </div>

      {/* ── 統計カード ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }} className="fade-in">
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>偏差値（推定）</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-accent)' }}>{results.deviation}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>足切り科目</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: failedSubjects.length === 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
            {failedSubjects.length} 科目
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>経過時間</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatTime(results.timeTaken)}</div>
        </div>
      </div>

      {/* ── 総合評価・分析 ── */}
      <div className="card fade-in" style={{ padding: '24px', marginBottom: '28px', animationDelay: '0.1s' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊</span> 総合評価
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* 得意科目 */}
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: 600 }}>
              🌟 得意科目
            </div>
            {topSubjects.map(r => (
              <div key={r.subjectId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.85rem' }}>{r.subjectName.replace('及び労働安全衛生法', '').replace('その他の労働に関する一般常識', '').replace('に関する一般常識', '')}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-success)' }}>{r.percentage}%</span>
              </div>
            ))}
          </div>

          {/* 苦手科目 */}
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: 600 }}>
              ⚠️ 重点強化科目
            </div>
            {weakSubjects.map(r => (
              <div key={r.subjectId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.85rem' }}>{r.subjectName.replace('及び労働安全衛生法', '').replace('その他の労働に関する一般常識', '').replace('に関する一般常識', '')}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: r.isPassing ? 'var(--color-text-muted)' : 'var(--color-error)' }}>{r.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* アドバイスコメント */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.7
        }}>
          {results.totalPercentage >= 80 ? (
            <>優秀な成績です！全科目にわたって高い理解度が見受けられます。本試験に向けて弱点の最終確認を進めましょう。</>
          ) : results.totalPercentage >= 65 ? (
            <>合格圏内の実力があります。重点強化科目を集中的に学習し、得点率70%以上を目指しましょう。</>
          ) : results.totalPercentage >= 50 ? (
            <>基礎力はついています。苦手科目への重点的な取り組みと、間違えた問題の復習で底上げを図りましょう。</>
          ) : (
            <>各科目の基本条文・判例の理解を深めることが先決です。復習ボタンから間違えた問題を見直してください。</>
          )}
        </div>
      </div>

      {/* ── 科目別詳細 ── */}
      <div className="fade-in" style={{ animationDelay: '0.2s', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>📋 科目別詳細</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {results.subjectResults.map((r) => {
            const g = getGrade(r.percentage);
            return (
              <div key={r.subjectId} className="card" style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>{r.subjectName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="progress-bar" style={{ width: '100px' }}>
                      <div className="progress-bar-fill" style={{ width: `${r.percentage}%`, background: g.color }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {r.score}/{r.maxScore}点
                    </span>
                  </div>
                </div>

                {/* グレードバッジ */}
                <div style={{
                  background: g.bg, color: g.color,
                  border: `1px solid ${g.color}`,
                  borderRadius: '6px',
                  padding: '3px 10px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  minWidth: '42px',
                  textAlign: 'center'
                }}>
                  {g.grade}
                </div>

                {/* 足切り判定 */}
                <div style={{ textAlign: 'right', minWidth: '52px' }}>
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 700,
                    color: r.isPassing ? 'var(--color-success)' : 'var(--color-error)'
                  }}>
                    {r.isPassing ? '✓ 突破' : '✗ 足切'}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    基準{r.passingScore}点
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ボタン群 ── */}
      <div style={{
        textAlign: 'center',
        display: 'flex',
        gap: '14px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button className="btn btn-secondary" onClick={handleReturn} style={{ minWidth: '140px' }}>
          トップに戻る
        </button>
        <button className="btn btn-primary" onClick={handleReview} style={{ minWidth: '140px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          間違えた問題を復習
        </button>
        <button className="btn" onClick={handleAnalytics} style={{
          minWidth: '140px',
          background: 'rgba(52, 152, 219, 0.12)',
          border: '1px solid rgba(52, 152, 219, 0.4)',
          color: 'var(--color-info)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          学習分析
        </button>
      </div>
    </main>
  );
}
