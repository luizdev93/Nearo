import { supabase } from './api/supabase_client';
import { ServiceResponse } from './auth_service';
import { AppNotification } from '../models/notification';

export const notificationService = {
  async getNotifications(
    userId: string,
  ): Promise<ServiceResponse<AppNotification[]>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) return { data: null, error: error.message };
      return { data: (data ?? []) as AppNotification[], error: null };
    } catch {
      return { data: null, error: 'Failed to load notifications' };
    }
  },

  async markAsRead(notificationId: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch {
      return { data: null, error: 'Failed to mark notification as read' };
    }
  },

  async markAllAsRead(userId: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch {
      return { data: null, error: 'Failed to mark notifications as read' };
    }
  },

  async getUnreadCount(userId: string): Promise<ServiceResponse<number>> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      if (error) return { data: null, error: error.message };
      return { data: count ?? 0, error: null };
    } catch {
      return { data: null, error: 'Failed to get unread count' };
    }
  },
};
