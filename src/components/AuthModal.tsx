'use client';

import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { isFirebaseConfigured } from '../lib/firebase';

function translateFirebaseError(msg: string): string {
  if (msg.includes('email-already-in-use')) return 'このメールアドレスは既に使用されています';
  if (msg.includes('wrong-password') || msg.includes('invalid-credential')) return 'メールアドレスまたはパスワードが正しくありません';
  if (msg.includes('weak-password')) return 'パスワードは6文字以上必要です';
  if (msg.includes('invalid-email')) return '有効なメールアドレスを入力してください';
  if (msg.includes('too-many-requests')) return 'ログイン試行が多すぎます。しばらく待ってください';
  if (msg.includes('user-not-found')) return 'このメールアドレスのアカウントが見つかりません';
  return msg;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-elevated)',
  color: 'var(--color-text)',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  marginBottom: '5px',
  letterSpacing: '0.03em',
};

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, loginWithEmail, signUpWithEmail, loginWithGoogle } =
    useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showAuthModal) return null;

  const reset = () => { setError(''); setEmail(''); setPassword(''); setDisplayName(''); };

  const switchMode = (m: 'login' | 'signup') => { setMode(m); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) return;
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!displayName.trim()) { setError('表示名を入力してください'); setLoading(false); return; }
        await signUpWithEmail(email, password, displayName);
      }
      reset();
      setShowAuthModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました';
      setError(translateFirebaseError(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      setShowAuthModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました';
      if (!msg.includes('popup-closed') && !msg.includes('cancelled')) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(6px)',
      }}
      onClick={() => setShowAuthModal(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="fade-in"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '32px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        }}
      >
        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {mode === 'login' ? 'ログイン' : 'アカウント作成'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>SHAROPASS</div>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.4rem', lineHeight: 1, padding: '4px' }}
          >×</button>
        </div>

        {/* タブ切り替え */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--color-bg-elevated)', borderRadius: '10px', padding: '4px' }}>
          {(['login', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: '7px',
                cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
                background: mode === m ? 'var(--color-accent)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--color-text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {m === 'login' ? 'ログイン' : '新規登録'}
            </button>
          ))}
        </div>

        {/* Googleログイン */}
        {isFirebaseConfigured && (
          <>
            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: '100%', padding: '11px', marginBottom: '8px',
                background: '#fff', color: '#333',
                border: '1px solid #ccc', borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: loading ? 0.6 : 1, transition: 'all 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Googleでログイン
            </button>
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.78rem', margin: '12px 0' }}>
              ── または ──
            </div>
          </>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'signup' && (
            <div>
              <label style={labelStyle}>表示名</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="山田 太郎"
                required
                style={inputStyle}
              />
            </div>
          )}
          <div>
            <label style={labelStyle}>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>パスワード {mode === 'signup' && <span style={{ fontWeight: 400 }}>(6文字以上)</span>}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(231,76,60,0.1)',
              border: '1px solid rgba(231,76,60,0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.83rem',
              color: 'var(--color-error)',
            }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isFirebaseConfigured}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '4px' }}
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウントを作成'}
          </button>
        </form>

        {!isFirebaseConfigured && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '16px' }}>
            ⚠️ Firebase未設定のため認証は使用できません
          </p>
        )}
      </div>
    </div>
  );
}
