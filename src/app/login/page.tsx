'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { registerUser, loginUser, isSakuraConfigured } from '../../lib/sakuraApi';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, loginDemo } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await loginUser(email, password);
      } else {
        result = await registerUser(email, password, displayName);
      }
      setUser(result.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
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
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📚</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>
            社労士模試
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'アカウントにログイン' : '新規アカウント登録'}
          </p>
        </div>

        {/* フォーム */}
        <div className="card" style={{ padding: '32px' }}>
          {!isSakuraConfigured && (
            <div style={{
              background: 'rgba(232,160,32,0.1)',
              border: '1px solid rgba(232,160,32,0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.82rem',
              color: 'var(--color-accent)',
            }}>
              ⚠️ サーバーAPI未設定のため、デモモードのみ使用可能です
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>
                  表示名
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="例：山田太郎"
                  disabled={!isSakuraConfigured}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                disabled={!isSakuraConfigured}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>
                パスワード（8文字以上）
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={!isSakuraConfigured}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)',
                borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
                fontSize: '0.85rem', color: 'var(--color-error)',
              }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !isSakuraConfigured}
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
            >
              {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録する'}
            </button>
          </form>

          <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            または
          </div>

          {/* デモログイン */}
          <button
            className="btn btn-secondary"
            onClick={handleDemo}
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            🎮 デモモードで試す（登録不要）
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {mode === 'login' ? (
              <>アカウントをお持ちでない方は{' '}
                <button
                  onClick={() => { setMode('register'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600 }}
                >
                  新規登録
                </button>
              </>
            ) : (
              <>すでにアカウントをお持ちの方は{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600 }}
                >
                  ログイン
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
