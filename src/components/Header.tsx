'use client';

import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'next/navigation';
import { isFirebaseConfigured } from '../lib/firebase';
import Image from 'next/image';

export default function Header() {
  const { user, isDemo, loginWithGoogle, logout } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!isFirebaseConfigured) {
      router.push('/login');
      return;
    }
    try {
      await loginWithGoogle();
    } catch {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--color-border)',
      background: 'rgba(15,17,26,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 20px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* ロゴ */}
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-text)',
          }}
        >
          <span style={{ fontSize: '1.3rem' }}>📚</span>
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em' }}>
            SHAROPASS
          </span>
        </button>

        {/* 右側：ユーザー情報 or ログインボタン */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && !isDemo ? (
            <>
              {/* ユーザーアイコン & 名前 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName}
                    width={32}
                    height={32}
                    style={{ borderRadius: '50%', border: '2px solid var(--color-border)' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--color-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, color: '#fff',
                  }}>
                    {user.displayName?.[0] ?? 'U'}
                  </div>
                )}
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                ログアウト
              </button>
            </>
          ) : user && isDemo ? (
            <>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>デモ中</span>
              <button
                onClick={handleLogin}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Googleでログイン
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Googleでログイン
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
