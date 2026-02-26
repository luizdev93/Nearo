import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors, spacing, typography } from '../../theme';
import { Avatar } from '../common/Avatar';

interface ConversationItemProps {
  avatar: string | null;
  name: string;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  onPress: () => void;
  listingTitle?: string;
  listingImageUrl?: string | null;
}

/** Chat list row — avatar, name, last message, time, unread badge. */
export function ConversationItem({
  avatar,
  name,
  lastMessage,
  time,
  unreadCount = 0,
  onPress,
  listingTitle,
  listingImageUrl,
}: ConversationItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Avatar uri={avatar} name={name} size={48} />
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {name || 'User'}
          </Text>
          {time ? <Text style={styles.time}>{time}</Text> : null}
        </View>
        {listingTitle ? (
          <Text style={styles.listing} numberOfLines={1}>
            {listingTitle}
          </Text>
        ) : null}
        {lastMessage ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage}
          </Text>
        ) : null}
      </View>
      {listingImageUrl ? (
        <Image source={{ uri: listingImageUrl }} style={styles.listingImage} />
      ) : null}
      {unreadCount > 0 ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    ...typography.label,
    color: colors.text,
    flex: 1,
  },
  time: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  listing: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lastMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listingImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
});
