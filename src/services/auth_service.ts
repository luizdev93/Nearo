import * as WebBrowser from 'expo-web-browser';
import { supabase } from './api/supabase_client';
import { User } from '../models/user';
import { Session } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

function extractParamsFromUrl(url: string): {
  access_token: string | null;
  refresh_token: string | null;
} {
  try {
    const parsedUrl = new URL(url);
    const hash = parsedUrl.hash.substring(1);
    const params = new URLSearchParams(hash);
    return {
      access_token: params.get('access_token'),
      refresh_token: params.get('refresh_token'),
    };
  } catch {
    return { access_token: null, refresh_token: null };
  }
}

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

  async signInWithGoogle(): Promise<
    ServiceResponse<{ session: Session; user: User }>
  > {
    try {
      const redirectTo = 'nearo://google-auth';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: { prompt: 'consent' },
        },
      });

      if (error) return { data: null, error: error.message };
      if (!data?.url) return { data: null, error: 'No OAuth URL returned' };

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
        { showInRecents: true }
      );

      if (!result || result.type !== 'success') {
        return { data: null, error: 'Sign in was cancelled or failed' };
      }

      const params = extractParamsFromUrl(result.url);
      if (!params.access_token || !params.refresh_token) {
        return { data: null, error: 'Failed to get session from redirect' };
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

      if (sessionError) return { data: null, error: sessionError.message };
      if (!sessionData.session)
        return { data: null, error: 'No session returned' };

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (profileError) return { data: null, error: profileError.message };

      return {
        data: {
          session: sessionData.session,
          user: profile as User,
        },
        error: null,
      };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Failed to sign in with Google';
      return { data: null, error: message };
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
