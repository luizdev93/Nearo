import { supabase } from './api/supabase_client';
import { User, UserPreview } from '../models/user';
import { ServiceResponse } from './auth_service';

export const userService = {
  async getUser(userId: string): Promise<ServiceResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as User, error: null };
    } catch {
      return { data: null, error: 'Failed to load user' };
    }
  },

  async getUserPreview(userId: string): Promise<ServiceResponse<UserPreview>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url, rating_average, rating_count, created_at')
        .eq('id', userId)
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as UserPreview, error: null };
    } catch {
      return { data: null, error: 'Failed to load user' };
    }
  },

  async updateUser(
    userId: string,
    updates: { name?: string; avatar_url?: string; language?: string },
  ): Promise<ServiceResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as User, error: null };
    } catch {
      return { data: null, error: 'Failed to update user' };
    }
  },
};
