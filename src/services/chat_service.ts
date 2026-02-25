import { supabase } from './api/supabase_client';
import { ServiceResponse } from './auth_service';
import { Chat, ChatPreview } from '../models/chat';
import { Message } from '../models/message';
import { MESSAGES_PAGE_SIZE } from '../utils/constants';
import { RealtimeChannel } from '@supabase/supabase-js';

export const chatService = {
  async getChats(userId: string): Promise<ServiceResponse<ChatPreview[]>> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id, buyer_id, seller_id, listing_id, created_at,
          listings!listing_id(title, listing_images(url, position)),
          buyer:users!buyer_id(id, name, avatar_url, rating_average, rating_count, created_at),
          seller:users!seller_id(id, name, avatar_url, rating_average, rating_count, created_at)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) return { data: null, error: error.message };

      const chatPreviews: ChatPreview[] = await Promise.all(
        (data ?? []).map(async (chat: any) => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const otherUser =
            chat.buyer_id === userId ? chat.seller : chat.buyer;

          const listingImages = (chat.listings?.listing_images ?? []).sort(
            (a: any, b: any) => a.position - b.position,
          );

          return {
            id: chat.id,
            buyer_id: chat.buyer_id,
            seller_id: chat.seller_id,
            listing_id: chat.listing_id,
            created_at: chat.created_at,
            other_user: otherUser,
            listing_title: chat.listings?.title ?? '',
            listing_image_url: listingImages[0]?.url ?? null,
            last_message: lastMsg?.content ?? null,
            last_message_at: lastMsg?.created_at ?? chat.created_at,
            unread_count: 0,
          };
        }),
      );

      chatPreviews.sort(
        (a, b) =>
          new Date(b.last_message_at ?? b.created_at).getTime() -
          new Date(a.last_message_at ?? a.created_at).getTime(),
      );

      return { data: chatPreviews, error: null };
    } catch {
      return { data: null, error: 'Failed to load chats' };
    }
  },

  async getMessages(
    chatId: string,
    cursor: string | null,
  ): Promise<ServiceResponse<{ items: Message[]; cursor: string | null; hasMore: boolean }>> {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PAGE_SIZE);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;
      if (error) return { data: null, error: error.message };

      const items = ((data ?? []) as Message[]).reverse();
      const lastItem = data?.[data.length - 1];

      return {
        data: {
          items,
          cursor: lastItem?.created_at ?? null,
          hasMore: (data?.length ?? 0) === MESSAGES_PAGE_SIZE,
        },
        error: null,
      };
    } catch {
      return { data: null, error: 'Failed to load messages' };
    }
  },

  async sendMessage(
    chatId: string,
    senderId: string,
    content: string,
  ): Promise<ServiceResponse<Message>> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({ chat_id: chatId, sender_id: senderId, content })
        .select('*')
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as Message, error: null };
    } catch {
      return { data: null, error: 'Failed to send message' };
    }
  },

  async getOrCreateChat(
    buyerId: string,
    sellerId: string,
    listingId: string,
  ): Promise<ServiceResponse<Chat>> {
    try {
      const { data: existing } = await supabase
        .from('chats')
        .select('*')
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (existing) return { data: existing as Chat, error: null };

      const { data, error } = await supabase
        .from('chats')
        .insert({ buyer_id: buyerId, seller_id: sellerId, listing_id: listingId })
        .select('*')
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Chat, error: null };
    } catch {
      return { data: null, error: 'Failed to create chat' };
    }
  },

  subscribeToChat(
    chatId: string,
    onNewMessage: (message: Message) => void,
  ): RealtimeChannel {
    return supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          onNewMessage(payload.new as Message);
        },
      )
      .subscribe();
  },

  unsubscribeFromChat(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  },
};
