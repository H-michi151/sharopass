'use client';

import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-elevated)',
  color: 'var(--color-text)',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
};

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setLoading(true);
    setError('');
    try {
      if (db) {
        await addDoc(collection(db, 'contacts'), {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          createdAt: serverTimestamp(),
        });
      }
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setError('送信に失敗しました。しばらく後でお試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 20px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
        お問い合わせ
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: 1.7 }}>
        ご質問・アカウント削除依頼・その他お問い合わせは下記フォームよりお送りください。
        通常3〜5営業日以内にご返信します。
      </p>

      {sent ? (
        <div
          className="card fade-in"
          style={{
            padding: '48px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
            送信完了しました
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            お問い合わせありがとうございます。<br />
            内容を確認の上、ご返信いたします。
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => setSent(false)}
            style={{ padding: '10px 24px' }}
          >
            別の内容を送る
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                お名前 <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                メールアドレス <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                お問い合わせ内容 <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="ご質問・ご要望をご記入ください"
                required
                rows={6}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(231,76,60,0.1)',
                border: '1px solid rgba(231,76,60,0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                color: 'var(--color-error)',
              }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '12px', fontSize: '1rem', marginTop: '4px' }}
            >
              {loading ? '送信中...' : '送信する'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
