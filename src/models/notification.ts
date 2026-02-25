export type NotificationType = 'new_message' | 'listing_update' | 'rating_received';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  reference_id: string | null;
  read: boolean;
  created_at: string;
}
