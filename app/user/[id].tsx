import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../src/theme';
import { Avatar } from '../../src/components/common/Avatar';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { ListingCardComponent } from '../../src/components/cards/ListingCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { userService } from '../../src/services/user_service';
import { listingService } from '../../src/services/listing_service';
import { User } from '../../src/models/user';
import { ListingCard } from '../../src/models/listing';
import { formatRating, formatMemberSince } from '../../src/utils/formatters';

export default function PublicUserProfileScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    const [profileRes, listingsRes] = await Promise.all([
      userService.getUser(id!),
      listingService.getUserListings(id!, 'active'),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (listingsRes.data) setListings(listingsRes.data);
    setIsLoading(false);
  };

  if (isLoading || !profile) return <LoadingScreen />;

  return (
    <>
      <Stack.Screen options={{ title: profile.name || 'User' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Avatar uri={profile.avatar_url} name={profile.name} size={80} />
          <Text style={styles.name}>{profile.name || 'User'}</Text>
          {profile.rating_count > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={colors.featured} />
              <Text style={styles.rating}>
                {formatRating(profile.rating_average)} ({profile.rating_count})
              </Text>
            </View>
          )}
          <Text style={styles.memberSince}>
            {t('listing.detail.member_since', {
              date: formatMemberSince(profile.created_at),
            })}
          </Text>
        </View>

        {/* Listings */}
        <Text style={styles.sectionTitle}>
          {t('profile.active_listings')} ({listings.length})
        </Text>
        {listings.length > 0 ? (
          <View style={styles.listingGrid}>
            {listings.map((listing) => (
              <ListingCardComponent key={listing.id} listing={listing} />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>{t('profile.no_listings')}</Text>
        )}
      </ScrollView>
    </>
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
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xl,
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
