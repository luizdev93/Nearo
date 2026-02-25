import { supabase } from './api/supabase_client';
import { ServiceResponse } from './auth_service';
import { Rating } from '../models/rating';

export const ratingService = {
  async submitRating(
    raterId: string,
    ratedUserId: string,
    chatId: string,
    value: number,
  ): Promise<ServiceResponse<Rating>> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          rater_id: raterId,
          rated_user_id: ratedUserId,
          chat_id: chatId,
          value,
        })
        .select('*')
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as Rating, error: null };
    } catch {
      return { data: null, error: 'Failed to submit rating' };
    }
  },

  async hasRated(
    raterId: string,
    chatId: string,
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('id')
        .eq('rater_id', raterId)
        .eq('chat_id', chatId)
        .maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: !!data, error: null };
    } catch {
      return { data: null, error: 'Failed to check rating' };
    }
  },

  async getUserRatings(userId: string): Promise<ServiceResponse<Rating[]>> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('rated_user_id', userId)
        .order('created_at', { ascending: false });
      if (error) return { data: null, error: error.message };
      return { data: (data ?? []) as Rating[], error: null };
    } catch {
      return { data: null, error: 'Failed to load ratings' };
    }
  },
};
