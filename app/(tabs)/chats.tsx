import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../src/theme';
import { ScreenContainer } from '../../src/components/layout/ScreenContainer';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { ConversationItem } from '../../src/components/chat/ConversationItem';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useAuthStore } from '../../src/state/auth_store';
import { useChatStore } from '../../src/state/chat_store';
import { ChatPreview } from '../../src/models/chat';
import { formatChatTimestamp } from '../../src/utils/formatters';

export default function ChatsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const { chats, isLoading, loadChats } = useChatStore();

  useEffect(() => {
    if (user) loadChats(user.id);
  }, [user]);

  const handleRefresh = useCallback(() => {
    if (user) loadChats(user.id);
  }, [user]);

  if (!session) {
    return (
      <ScreenContainer>
        <View style={styles.authPrompt}>
          <Text style={styles.authText}>{t('profile.login_required')}</Text>
          <GradientButton
            label={t('auth.login.continue')}
            onPress={() => router.push('/(auth)/login')}
            fullWidth
          />
        </View>
      </ScreenContainer>
    );
  }

  const renderItem = ({ item }: { item: ChatPreview }) => (
    <ConversationItem
      avatar={item.other_user.avatar_url}
      name={item.other_user.name ?? 'User'}
      lastMessage={item.last_message ?? undefined}
      time={item.last_message_at ? formatChatTimestamp(item.last_message_at) : undefined}
      unreadCount={0}
      onPress={() => router.push(`/chat/${item.id}`)}
      listingTitle={item.listing_title}
      listingImageUrl={item.listing_image_url}
    />
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState icon="chatbubbles-outline" title={t('chat.empty')} />
    );
  };

  return (
    <ScreenContainer noPadding>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: spacing.lg,
  },
  authText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.lg + 48 + spacing.md,
  },
});
