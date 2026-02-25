export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  images?: MessageImage[];
}

export interface MessageImage {
  id: string;
  message_id: string;
  url: string;
}
