'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { isFirebaseConfigured } from '../lib/firebase';

interface BannerData {
  message: string;
  active: boolean;
  updatedAt: string;
}

const getSessionKey = (updatedAt: string) => `announcement_dismissed_${updatedAt}`;

export default function AnnouncementBanner() {
  const [data, setData] = useState<BannerData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const unsub = onSnapshot(doc(db, 'announcements', 'latest'), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as BannerData;
        if (sessionStorage.getItem(getSessionKey(d.updatedAt))) {
          setDismissed(true);
        }
        setData(d);
      }
    });
    return () => unsub();
  }, []);

  const handleDismiss = () => {
    if (data) sessionStorage.setItem(getSessionKey(data.updatedAt), '1');
    setDismissed(true);
  };

  if (dismissed || !data || !data.active) return null;

  return (
    <div
      className="fade-in"
      style={{
        marginBottom: '24px',
        padding: '12px 16px',
        background: 'rgba(232,160,32,0.1)',
        border: '1px solid rgba(232,160,32,0.35)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <span style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
        📢 {data.message}
      </span>
      <button
        onClick={handleDismiss}
        aria-label="閉じる"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          fontSize: '1.1rem',
          lineHeight: 1,
          padding: '2px 6px',
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
