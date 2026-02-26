import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { User } from '../models/user';
import { authService } from '../services/auth_service';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  sendOTP: (phone: string) => Promise<boolean>;
  verifyOTP: (phone: string, code: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  isHydrated: false,
  error: null,

  hydrate: async () => {
    try {
      const { data: session } = await authService.getSession();
      if (session) {
        const { data: user } = await authService.getProfile(session.user.id);
        set({ session, user, isLoading: false, isHydrated: true });
      } else {
        set({ session: null, user: null, isLoading: false, isHydrated: true });
      }

      authService.onAuthStateChange(async (newSession) => {
        if (newSession) {
          const { data: user } = await authService.getProfile(newSession.user.id);
          set({ session: newSession, user });
        } else {
          set({ session: null, user: null });
        }
      });
    } catch {
      set({ isLoading: false, isHydrated: true });
    }
  },

  sendOTP: async (phone: string) => {
    set({ isLoading: true, error: null });
    const { error } = await authService.sendOTP(phone);
    if (error) {
      set({ isLoading: false, error });
      return false;
    }
    set({ isLoading: false });
    return true;
  },

  verifyOTP: async (phone: string, code: string) => {
    set({ isLoading: true, error: null });
    const { data, error } = await authService.verifyOTP(phone, code);
    if (error || !data) {
      set({ isLoading: false, error: error ?? 'Verification failed' });
      return false;
    }
    set({
      session: data.session,
      user: data.user,
      isLoading: false,
    });
    return true;
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    const { data, error } = await authService.signInWithGoogle();
    if (error || !data) {
      set({ isLoading: false, error: error ?? 'Google sign in failed' });
      return false;
    }
    set({
      session: data.session,
      user: data.user,
      isLoading: false,
    });
    return true;
  },

  signOut: async () => {
    await authService.signOut();
    set({ session: null, user: null });
  },

  setUser: (user: User) => set({ user }),

  clearError: () => set({ error: null }),
}));
