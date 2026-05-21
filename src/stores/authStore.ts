import { create } from 'zustand';
import type { User, AuthTokens } from '@/src/types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user, tokens) =>
    set({ user, tokens, isAuthenticated: true, isLoading: false }),
  logout: () =>
    set({ user: null, tokens: null, isAuthenticated: false, isLoading: false }),
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
