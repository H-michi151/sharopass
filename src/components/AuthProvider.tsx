'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * Firebase onAuthStateChanged を監視し、authStore に同期するプロバイダーコンポーネント。
 * layout.tsx に配置して全ページで認証状態を管理する。
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const subscribeToAuthChanges = useAuthStore((s) => s.subscribeToAuthChanges);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges();
    return () => unsubscribe();
  }, [subscribeToAuthChanges]);

  return <>{children}</>;
}
