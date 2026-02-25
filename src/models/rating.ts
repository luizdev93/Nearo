export interface Rating {
  id: string;
  rater_id: string;
  rated_user_id: string;
  chat_id: string;
  value: number;
  created_at: string;
}
