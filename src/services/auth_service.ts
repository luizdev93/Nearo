import { supabase } from './api/supabase_client';
import { User } from '../models/user';
import { Session } from '@supabase/supabase-js';

export type ServiceResponse<T> = {
  data: T | null;
  error: string | null;
};

export const authService = {
  async sendOTP(phone: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch {
      return { data: null, error: 'Failed to send verification code' };
    }
  },

  async verifyOTP(
    phone: string,
    token: string,
  ): Promise<ServiceResponse<{ session: Session; user: User }>> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) return { data: null, error: error.message };
      if (!data.session) return { data: null, error: 'No session returned' };

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      if (profileError) return { data: null, error: profileError.message };

      return {
        data: { session: data.session, user: profile as User },
        error: null,
      };
    } catch {
      return { data: null, error: 'Failed to verify code' };
    }
  },

  async getSession(): Promise<ServiceResponse<Session>> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return { data: null, error: error.message };
      return { data: data.session, error: null };
    } catch {
      return { data: null, error: 'Failed to get session' };
    }
  },

  async getProfile(userId: string): Promise<ServiceResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as User, error: null };
    } catch {
      return { data: null, error: 'Failed to get profile' };
    }
  },

  async signOut(): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch {
      return { data: null, error: 'Failed to sign out' };
    }
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return data.subscription;
  },
};
