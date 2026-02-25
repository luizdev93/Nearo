export interface User {
  id: string;
  name: string;
  avatar_url: string | null;
  phone_number: string;
  verified: boolean;
  rating_average: number;
  rating_count: number;
  language: string;
  created_at: string;
}

export interface UserPreview {
  id: string;
  name: string;
  avatar_url: string | null;
  rating_average: number;
  rating_count: number;
  created_at: string;
}
