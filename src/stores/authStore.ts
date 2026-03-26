import { create } from 'zustand';
import { User } from '../types';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type Unsubscribe,
} from 'firebase/auth';
import { createOrUpdateUserDoc } from '../lib/firebaseUser';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isDemo: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  loginDemo: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  subscribeToAuthChanges: () => Unsubscribe | (() => void);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isDemo: false,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  loginDemo: () =>
    set({
      user: {
        uid: 'demo-user',
        email: 'demo@example.com',
        displayName: 'デモユーザー',
      },
      isDemo: true,
      isLoading: false,
    }),

  loginWithGoogle: async () => {
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase が設定されていません');
    }
    set({ isLoading: true });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const user: User = {
        uid: fbUser.uid,
        email: fbUser.email ?? '',
        displayName: fbUser.displayName ?? 'ユーザー',
        photoURL: fbUser.photoURL ?? undefined,
      };
      // Firestore にユーザードキュメントを作成/更新
      await createOrUpdateUserDoc(
        fbUser.uid,
        fbUser.email ?? '',
        fbUser.displayName ?? 'ユーザー',
        fbUser.photoURL ?? undefined
      );
      set({ user, isDemo: false, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    if (auth && isFirebaseConfigured) {
      await signOut(auth);
    }
    set({ user: null, isDemo: false, isLoading: false });
  },

  subscribeToAuthChanges: () => {
    if (!auth || !isFirebaseConfigured) {
      set({ isLoading: false });
      return () => {};
    }
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const user: User = {
          uid: fbUser.uid,
          email: fbUser.email ?? '',
          displayName: fbUser.displayName ?? 'ユーザー',
          photoURL: fbUser.photoURL ?? undefined,
        };
        await createOrUpdateUserDoc(
          fbUser.uid,
          fbUser.email ?? '',
          fbUser.displayName ?? 'ユーザー',
          fbUser.photoURL ?? undefined
        );
        set({ user, isDemo: false, isLoading: false });
      } else {
        set({ user: null, isDemo: false, isLoading: false });
      }
    });
  },
}));
