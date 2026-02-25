import { create } from 'zustand';
import { ChatPreview } from '../models/chat';
import { Message } from '../models/message';
import { chatService } from '../services/chat_service';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatState {
  chats: ChatPreview[];
  activeMessages: Message[];
  activeChatId: string | null;
  messageCursor: string | null;
  messageHasMore: boolean;

  isLoading: boolean;
  isLoadingMore: boolean;
  isSending: boolean;
  error: string | null;

  _channel: RealtimeChannel | null;

  loadChats: (userId: string) => Promise<void>;
  openChat: (chatId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (chatId: string, senderId: string, content: string) => Promise<boolean>;
  getOrCreateChat: (buyerId: string, sellerId: string, listingId: string) => Promise<string | null>;
  subscribe: (chatId: string, currentUserId: string) => void;
  unsubscribe: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeMessages: [],
  activeChatId: null,
  messageCursor: null,
  messageHasMore: true,

  isLoading: false,
  isLoadingMore: false,
  isSending: false,
  error: null,

  _channel: null,

  loadChats: async (userId: string) => {
    set({ isLoading: true, error: null });
    const { data, error } = await chatService.getChats(userId);
    if (error) {
      set({ isLoading: false, error });
    } else {
      set({ chats: data ?? [], isLoading: false });
    }
  },

  openChat: async (chatId: string) => {
    set({
      isLoading: true,
      error: null,
      activeChatId: chatId,
      activeMessages: [],
      messageCursor: null,
      messageHasMore: true,
    });

    const { data, error } = await chatService.getMessages(chatId, null);
    if (error) {
      set({ isLoading: false, error });
    } else if (data) {
      set({
        activeMessages: data.items,
        messageCursor: data.cursor,
        messageHasMore: data.hasMore,
        isLoading: false,
      });
    }
  },

  loadMoreMessages: async () => {
    const { activeChatId, messageCursor, messageHasMore, isLoadingMore } = get();
    if (!activeChatId || !messageHasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    const { data } = await chatService.getMessages(activeChatId, messageCursor);
    if (data) {
      set((state) => ({
        activeMessages: [...data.items, ...state.activeMessages],
        messageCursor: data.cursor,
        messageHasMore: data.hasMore,
        isLoadingMore: false,
      }));
    } else {
      set({ isLoadingMore: false });
    }
  },

  sendMessage: async (chatId: string, senderId: string, content: string) => {
    set({ isSending: true });

    const optimisticMsg: Message = {
      id: `temp_${Date.now()}`,
      chat_id: chatId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      activeMessages: [...state.activeMessages, optimisticMsg],
    }));

    const { data, error } = await chatService.sendMessage(chatId, senderId, content);
    if (error) {
      set((state) => ({
        activeMessages: state.activeMessages.filter((m) => m.id !== optimisticMsg.id),
        isSending: false,
        error,
      }));
      return false;
    }

    if (data) {
      set((state) => ({
        activeMessages: state.activeMessages.map((m) =>
          m.id === optimisticMsg.id ? data : m,
        ),
        isSending: false,
      }));
    }

    return true;
  },

  getOrCreateChat: async (buyerId, sellerId, listingId) => {
    const { data, error } = await chatService.getOrCreateChat(buyerId, sellerId, listingId);
    if (error || !data) return null;
    return data.id;
  },

  subscribe: (chatId: string, currentUserId: string) => {
    const existing = get()._channel;
    if (existing) chatService.unsubscribeFromChat(existing);

    const channel = chatService.subscribeToChat(chatId, (message: Message) => {
      if (message.sender_id !== currentUserId) {
        set((state) => {
          const exists = state.activeMessages.some((m) => m.id === message.id);
          if (exists) return state;
          return { activeMessages: [...state.activeMessages, message] };
        });
      }
    });

    set({ _channel: channel });
  },

  unsubscribe: () => {
    const channel = get()._channel;
    if (channel) {
      chatService.unsubscribeFromChat(channel);
      set({ _channel: null, activeChatId: null });
    }
  },

  clearError: () => set({ error: null }),
}));
