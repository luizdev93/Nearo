import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { Avatar } from '../../src/components/common/Avatar';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useAuthStore } from '../../src/state/auth_store';
import { useChatStore } from '../../src/state/chat_store';
import { ChatPreview } from '../../src/models/chat';
import { formatChatTimestamp } from '../../src/utils/formatters';
import { Button } from '../../src/components/common/Button';

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
      <View style={styles.authPrompt}>
        <Text style={styles.authText}>{t('profile.login_required')}</Text>
        <Button
          title={t('auth.login.continue')}
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    );
  }

  const renderItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${item.id}`)}
      activeOpacity={0.7}
    >
      <Avatar uri={item.other_user.avatar_url} name={item.other_user.name} size={48} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.other_user.name || 'User'}
          </Text>
          {item.last_message_at && (
            <Text style={styles.chatTime}>
              {formatChatTimestamp(item.last_message_at)}
            </Text>
          )}
        </View>
        <Text style={styles.chatListing} numberOfLines={1}>
          {item.listing_title}
        </Text>
        {item.last_message && (
          <Text style={styles.chatLastMessage} numberOfLines={1}>
            {item.last_message}
          </Text>
        )}
      </View>
      {item.listing_image_url && (
        <Image
          source={{ uri: item.listing_image_url }}
          style={styles.chatListingImage}
          contentFit="cover"
        />
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState icon="chatbubbles-outline" title={t('chat.empty')} />
    );
  };

  return (
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
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  authText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    ...typography.label,
    color: colors.text,
    flex: 1,
  },
  chatTime: {
    ...typography.caption,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  chatListing: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  chatLastMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chatListingImage: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.lg + 48 + spacing.md,
  },
});
