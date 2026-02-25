import { UserPreview } from './user';

export interface Chat {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  created_at: string;
}

export interface ChatPreview extends Chat {
  other_user: UserPreview;
  listing_title: string;
  listing_image_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}
