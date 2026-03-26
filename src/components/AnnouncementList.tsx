'use client';

import { useEffect, useState } from 'react';
import {
  getPublishedAnnouncements,
  type Announcement,
} from '../lib/firestoreAnnouncements';

function formatDate(ts: import('firebase/firestore').Timestamp | null): string {
  if (!ts) return '';
  try {
    return ts.toDate().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getPublishedAnnouncements(5)
      .then((data) => {
        setAnnouncements(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || announcements.length === 0) return null;

  return (
    <section style={{ marginBottom: '40px' }} className="fade-in">
      <h2 style={{
        fontSize: '0.95rem',
        fontWeight: 700,
        marginBottom: '12px',
        color: 'var(--color-text-muted)',
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span>📢</span> お知らせ
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {announcements.map((a) => (
          <div
            key={a.id}
            className="card"
            style={{ padding: '16px 20px', borderLeft: '3px solid var(--color-accent)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                {a.title}
              </h3>
              {a.createdAt && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(a.createdAt)}
                </span>
              )}
            </div>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}>
              {a.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
