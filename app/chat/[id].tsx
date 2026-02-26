import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { ScreenContainer } from '../../src/components/layout/ScreenContainer';
import { ChatBubble } from '../../src/components/chat/ChatBubble';
import { ChatInputBar } from '../../src/components/chat/ChatInputBar';
import { useAuthStore } from '../../src/state/auth_store';
import { useChatStore } from '../../src/state/chat_store';
import { Message } from '../../src/models/message';
import { formatChatTimestamp } from '../../src/utils/formatters';

export default function ChatConversationScreen() {
  const { t } = useTranslation();
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const {
    activeMessages,
    isLoading,
    isLoadingMore,
    isSending,
    openChat,
    sendMessage,
    loadMoreMessages,
    subscribe,
    unsubscribe,
  } = useChatStore();

  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!chatId || !user) return;
    openChat(chatId);
    subscribe(chatId, user.id);
    return () => unsubscribe();
  }, [chatId, user]);

  useEffect(() => {
    if (activeMessages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [activeMessages.length]);

  const handleSend = async () => {
    if (!text.trim() || !chatId || !user) return;
    const msg = text.trim();
    setText('');
    await sendMessage(chatId, user.id, msg);
  };

  const handleQuickMessage = (msg: string) => {
    if (!chatId || !user) return;
    sendMessage(chatId, user.id, msg);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === user?.id;
    return (
      <ChatBubble
        message={item.content}
        isMine={!!isMine}
        timestamp={formatChatTimestamp(item.created_at)}
      />
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t('chat.title') }} />
      <ScreenContainer edges={['top', 'left', 'right']} noPadding>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={activeMessages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              onStartReached={loadMoreMessages}
              onStartReachedThreshold={0.1}
              inverted={false}
              ListHeaderComponent={
                isLoadingMore ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={styles.loadingMore}
                  />
                ) : null
              }
            />
          )}

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => handleQuickMessage(t('chat.quick_available'))}
            >
              <Text style={styles.quickButtonText}>{t('chat.quick_available')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => handleQuickMessage(t('chat.quick_offer'))}
            >
              <Text style={styles.quickButtonText}>{t('chat.quick_offer')}</Text>
            </TouchableOpacity>
          </View>

          <ChatInputBar
            value={text}
            onChange={setText}
            onSend={handleSend}
            placeholder={t('chat.placeholder')}
            disabled={isSending}
          />
        </KeyboardAvoidingView>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  messageBubbleWrapper: {
    alignItems: 'flex-start',
    maxWidth: '80%',
  },
  messageMineWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.bubble,
    maxWidth: '100%',
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  bubbleOther: {
    backgroundColor: colors.surfaceSecondary,
    borderBottomLeftRadius: borderRadius.sm,
  },
  messageText: {
    ...typography.body,
    color: colors.text,
  },
  messageTextMine: {
    color: colors.textInverse,
  },
  messageTime: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  loadingMore: {
    padding: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  quickButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quickButtonText: {
    ...typography.caption,
    color: colors.primary,
  },
});
