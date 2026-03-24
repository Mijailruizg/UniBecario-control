import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/supabase';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, session: null })
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, session: state.session })
    }
  )
);
