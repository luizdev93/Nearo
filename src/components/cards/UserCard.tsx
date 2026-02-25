import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { UserPreview } from '../../models/user';
import { Avatar } from '../common/Avatar';
import { formatRating, formatMemberSince } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';

interface UserCardProps {
  user: UserPreview;
  onPress?: () => void;
}

export function UserCard({ user, onPress }: UserCardProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <Avatar uri={user.avatar_url} name={user.name} size={48} />
      <View style={styles.info}>
        <Text style={styles.name}>{user.name || 'User'}</Text>
        {user.rating_count > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.featured} />
            <Text style={styles.rating}>
              {formatRating(user.rating_average)} ({user.rating_count})
            </Text>
          </View>
        )}
        <Text style={styles.memberSince}>
          {t('listing.detail.member_since', {
            date: formatMemberSince(user.created_at),
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.label,
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  memberSince: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
