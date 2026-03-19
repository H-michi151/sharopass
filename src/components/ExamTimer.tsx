'use client';

import { useEffect, useState } from 'react';
import { useExamStore } from '../stores/examStore';

export default function ExamTimer() {
  const session = useExamStore((s) => s.session);
  const decrementTimer = useExamStore((s) => s.decrementTimer);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!session || session.status !== 'in_progress') return;
    const interval = setInterval(() => {
      decrementTimer();
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.status, decrementTimer]);

  if (!session) return null;

  const remaining = session.remainingTime;
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  
  const isWarning = remaining < 300; // 5分以下
  const isDanger = remaining < 60;   // 1分以下

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      borderRadius: 'var(--radius-sm)',
      background: isDanger ? 'rgba(231,76,60,0.2)' : isWarning ? 'rgba(243,156,18,0.2)' : 'var(--color-bg-elevated)',
      border: `1px solid ${isDanger ? 'var(--color-error)' : isWarning ? 'var(--color-warning)' : 'var(--color-border)'}`,
      animation: isDanger ? 'pulse 1s infinite' : 'none',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span style={{
        fontWeight: 700,
        fontSize: '1.1rem',
        fontVariantNumeric: 'tabular-nums',
        color: isDanger ? 'var(--color-error)' : isWarning ? 'var(--color-warning)' : 'var(--color-text)',
      }}>
        {hours > 0 && `${String(hours).padStart(2, '0')}:`}
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
