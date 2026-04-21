'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { isFirebaseConfigured } from '../../lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const { loginDemo, loginWithGoogle, setShowAuthModal } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      // ポップアップ閉じた場合はエラーを無視
      if (message.includes('popup-closed') || message.includes('cancelled')) {
        setError('');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    loginDemo();
    router.push('/');
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--color-bg)',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📚</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>
            SHAROPASS
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            社会保険労務士試験 模擬試験アプリ
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {!isFirebaseConfigured && (
            <div style={{
              background: 'rgba(232,160,32,0.1)',
              border: '1px solid rgba(232,160,32,0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.82rem',
              color: 'var(--color-accent)',
            }}>
              ⚠️ Firebase未設定のため、デモモードのみ使用可能です
            </div>
          )}

          {/* Googleログインボタン */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            {!loading && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? '処理中...' : 'Googleアカウントでログイン'}
          </button>

          {/* ログインせずに続ける説明 */}
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: '16px',
          }}>
            ログインすると学習記録が自動保存されます。<br />
            ログインなしでも問題を解くことができます。
          </p>

          {/* メール/パスワードログイン */}
          <button
            onClick={() => setShowAuthModal(true)}
            disabled={!isFirebaseConfigured}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '16px',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              color: 'var(--color-text)',
              cursor: isFirebaseConfigured ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isFirebaseConfigured ? 1 : 0.5,
              transition: 'all 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            メールアドレスでログイン / 新規登録
          </button>

          {error && (
            <div style={{
              background: 'rgba(231,76,60,0.1)',
              border: '1px solid rgba(231,76,60,0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.85rem',
              color: 'var(--color-error)',
            }}>
              ❌ {error}
            </div>
          )}

          <div style={{ textAlign: 'center', margin: '0 0 16px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            または
          </div>

          {/* デモログイン */}
          <button
            className="btn btn-secondary"
            onClick={handleDemo}
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            🎮 ログインせずに試す
          </button>

          {/* 同意文言 */}
          <p style={{
            marginTop: '16px',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            登録・ログインすることで、
            <a href="/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>プライバシーポリシー</a>
            および
            <a href="/terms" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>利用規約</a>
            に同意したものとみなします。
          </p>
        </div>
      </div>
    </main>
  );
}
