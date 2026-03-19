import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isDemo: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  loginDemo: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isDemo: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  loginDemo: () => set({
    user: {
      uid: 'demo-user',
      email: 'demo@example.com',
      displayName: 'デモユーザー',
    },
    isDemo: true,
  }),
  logout: () => set({ user: null, isDemo: false }),
}));
