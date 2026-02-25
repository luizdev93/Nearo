import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { Avatar } from '../../src/components/common/Avatar';
import { Button } from '../../src/components/common/Button';
import { ListingCardComponent } from '../../src/components/cards/ListingCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useAuthStore } from '../../src/state/auth_store';
import { useListingStore } from '../../src/state/listing_store';
import { formatRating, formatMemberSince } from '../../src/utils/formatters';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const { userListings, loadUserListings } = useListingStore();

  useEffect(() => {
    if (user) loadUserListings(user.id);
  }, [user]);

  if (!session || !user) {
    return (
      <View style={styles.authPrompt}>
        <EmptyState
          icon="person-outline"
          title={t('profile.login_required')}
        />
        <Button
          title={t('auth.login.continue')}
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar uri={user.avatar_url} name={user.name} size={80} />
        <Text style={styles.name}>{user.name || 'User'}</Text>
        {user.rating_count > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={colors.featured} />
            <Text style={styles.rating}>
              {t('profile.rating', {
                rating: formatRating(user.rating_average),
                count: user.rating_count,
              })}
            </Text>
          </View>
        )}
        <Text style={styles.memberSince}>
          {t('listing.detail.member_since', {
            date: formatMemberSince(user.created_at),
          })}
        </Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        <MenuItem
          icon="create-outline"
          label={t('profile.edit')}
          onPress={() => router.push('/edit-profile')}
        />
        <MenuItem
          icon="heart-outline"
          label={t('profile.favorites')}
          onPress={() => router.push('/favorites')}
        />
        <MenuItem
          icon="notifications-outline"
          label={t('profile.notifications')}
          onPress={() => router.push('/notifications')}
        />
        <MenuItem
          icon="log-out-outline"
          label={t('auth.sign_out')}
          onPress={signOut}
          destructive
        />
      </View>

      {/* User Listings */}
      <Text style={styles.sectionTitle}>{t('profile.my_listings')}</Text>
      {userListings.length > 0 ? (
        <View style={styles.listingGrid}>
          {userListings.map((listing) => (
            <ListingCardComponent key={listing.id} listing={listing} />
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>{t('profile.no_listings')}</Text>
      )}
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons
        name={icon}
        size={22}
        color={destructive ? colors.error : colors.text}
      />
      <Text style={[styles.menuLabel, destructive && styles.menuLabelDestructive]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  memberSince: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  menu: {
    marginVertical: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  menuLabelDestructive: {
    color: colors.error,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  listingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
