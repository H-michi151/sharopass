'use client';

import { useAuthStore } from '../stores/authStore';
import { useExamStore } from '../stores/examStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const TIME_OPTIONS_SENTAKU = [
  { label: '40分（短縮）', value: 40 },
  { label: '80分（本番）', value: 80 },
  { label: '120分（余裕）', value: 120 },
  { label: '無制限', value: 9999 },
];

const TIME_OPTIONS_TAKUITSU = [
  { label: '105分（短縮）', value: 105 },
  { label: '210分（本番）', value: 210 },
  { label: '270分（余裕）', value: 270 },
  { label: '無制限', value: 9999 },
];

export default function Dashboard() {
  const { user, loginDemo } = useAuthStore();
  const { customTimeLimitSentaku, customTimeLimitTakuitsu, setCustomTimeLimitSentaku, setCustomTimeLimitTakuitsu } = useExamStore();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user) loginDemo();
  }, [user, loginDemo]);

  const handleStart = (type: 'sentaku' | 'takuitsu') => {
    router.push(`/exam/${type}`);
  };

  if (!user) return null;

  const sentakuLabel = TIME_OPTIONS_SENTAKU.find(o => o.value === customTimeLimitSentaku)?.label || `${customTimeLimitSentaku}分`;
  const takuitsuLabel = TIME_OPTIONS_TAKUITSU.find(o => o.value === customTimeLimitTakuitsu)?.label || `${customTimeLimitTakuitsu}分`;

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 24px' }}>
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          marginBottom: '16px',
          background: 'linear-gradient(to right, #fff, var(--color-accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}>
          SHAROSHI MOCK EXAM
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
          社会保険労務士試験 合格への最短ルート
        </p>
      </header>

      {/* タイマー設定バー */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <button
          className="btn"
          style={{ fontSize: '0.85rem', gap: '6px', background: 'rgba(46,204,113,0.12)', border: '1px solid rgba(46,204,113,0.35)', color: 'var(--color-success)' }}
          onClick={() => router.push('/study')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          科目別学習
        </button>
        <button
          className="btn"
          style={{ fontSize: '0.85rem', gap: '6px', background: 'rgba(52,152,219,0.15)', border: '1px solid rgba(52,152,219,0.4)', color: 'var(--color-info)' }}
          onClick={() => router.push('/analytics')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          学習分析
        </button>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem', gap: '6px' }}
          onClick={() => setShowSettings(!showSettings)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          時間設定
        </button>
      </div>

      {showSettings && (
        <div className="card fade-in" style={{ marginBottom: '32px', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--color-accent)' }}>
            ⏱ 試験時間の設定
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '8px', display: 'block' }}>
                選択式（午前）
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TIME_OPTIONS_SENTAKU.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCustomTimeLimitSentaku(opt.value)}
                    className="btn"
                    style={{
                      fontSize: '0.85rem',
                      padding: '8px 14px',
                      background: customTimeLimitSentaku === opt.value ? 'rgba(232,160,32,0.2)' : 'var(--color-bg-elevated)',
                      border: `1px solid ${customTimeLimitSentaku === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      color: customTimeLimitSentaku === opt.value ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '8px', display: 'block' }}>
                択一式（午後）
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TIME_OPTIONS_TAKUITSU.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCustomTimeLimitTakuitsu(opt.value)}
                    className="btn"
                    style={{
                      fontSize: '0.85rem',
                      padding: '8px 14px',
                      background: customTimeLimitTakuitsu === opt.value ? 'rgba(232,160,32,0.2)' : 'var(--color-bg-elevated)',
                      border: `1px solid ${customTimeLimitTakuitsu === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      color: customTimeLimitTakuitsu === opt.value ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '80px' }}>
        {/* 選択式カード */}
        <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animationDelay: '0.1s' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ width: '50px', height: '50px', background: 'rgba(232, 160, 32, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
              </div>
              <span className="badge badge-accent">午前</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>選択式試験</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
              8科目各5空欄、計40問の空欄補充問題。足切りラインの突破が合格のカギとなります。
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {sentakuLabel}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                40点満点
              </span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => handleStart('sentaku')}>試験を開始する</button>
        </div>

        {/* 択一式カード */}
        <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animationDelay: '0.2s' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ width: '50px', height: '50px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-info)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <span className="badge" style={{ background: 'rgba(52, 152, 219, 0.2)', color: 'var(--color-info)' }}>午後</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>択一式試験</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
              7科目各10問、計70問の5肢択一問題。膨大な問題数をこなすスピードと正確性が求められます。
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {takuitsuLabel}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                70点満点
              </span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => handleStart('takuitsu')}>試験を開始する</button>
        </div>
      </div>

      <section className="fade-in" style={{ animationDelay: '0.3s' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px', color: 'var(--color-text-muted)' }}>学習のヒント</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--color-accent)', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>毎日1科目の復習</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>知識の定着には反復が必要です。苦手科目を優先しましょう。</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--color-success)', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>解答スピードの意識</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>択一式は1問3分以内を目指しましょう。</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
