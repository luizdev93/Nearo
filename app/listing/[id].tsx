import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { ScreenContainer } from '../../src/components/layout/ScreenContainer';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { SecondaryButton } from '../../src/components/ui/SecondaryButton';
import { IconButton } from '../../src/components/ui/IconButton';
import { Badge } from '../../src/components/common/Badge';
import { PriceTag } from '../../src/components/listings/PriceTag';
import { ListingImageCarousel } from '../../src/components/listings/ListingImageCarousel';
import { UserCard } from '../../src/components/cards/UserCard';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { ErrorView } from '../../src/components/common/ErrorView';
import { useListingStore } from '../../src/state/listing_store';
import { useAuthStore } from '../../src/state/auth_store';
import { useUserStore } from '../../src/state/user_store';
import { useChatStore } from '../../src/state/chat_store';

export default function ListingDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentListing, isLoading, error, loadListing } = useListingStore();
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const isFavorited = useUserStore((s) => id ? s.favoritedIds.has(id) : false);
  const toggleFavorite = useUserStore((s) => s.toggleFavorite);
  const getOrCreateChat = useChatStore((s) => s.getOrCreateChat);

  useEffect(() => {
    if (id) loadListing(id);
  }, [id]);

  const handleChatSeller = async () => {
    if (!session || !user || !currentListing) {
      router.push('/(auth)/login');
      return;
    }
    const chatId = await getOrCreateChat(user.id, currentListing.owner_id, currentListing.id);
    if (chatId) {
      router.push(`/chat/${chatId}`);
    }
  };

  const handleFavorite = () => {
    if (!session) {
      router.push('/(auth)/login');
      return;
    }
    if (id) toggleFavorite(id);
  };

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorView message={error} onRetry={() => id && loadListing(id)} />;
  if (!currentListing) return <LoadingScreen />;

  const listing = currentListing;
  const isOwner = user?.id === listing.owner_id;

  const imageUrls = listing.images.map((img) => img.url);

  return (
    <>
      <Stack.Screen options={{ title: listing.title }} />
      <ScreenContainer noPadding>
        <ScrollView style={styles.container}>
          <ListingImageCarousel images={imageUrls} />

          <View style={styles.details}>
            <View style={styles.badgeRow}>
              {listing.is_featured && (
                <Badge label={t('listing.detail.featured_badge')} variant="featured" />
              )}
              {listing.status === 'sold' && (
                <Badge label={t('listing.detail.sold')} variant="sold" />
              )}
            </View>

            <PriceTag price={listing.price} />
            <Text style={styles.title}>{listing.title}</Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            {listing.negotiable && (
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>{t('listing.detail.negotiable')}</Text>
              </View>
            )}
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>
                {listing.condition === 'new'
                  ? t('listing.create.condition_new')
                  : t('listing.create.condition_used')}
              </Text>
            </View>
          </View>

          {/* Location */}
          {listing.location_name && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.locationText}>{listing.location_name}</Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.descriptionLabel}>{t('listing.create.field_description')}</Text>
          <Text style={styles.description}>{listing.description}</Text>

          {/* Seller Card */}
          <Text style={styles.descriptionLabel}>{t('listing.detail.seller')}</Text>
          <UserCard
            user={listing.owner}
            onPress={() => router.push(`/user/${listing.owner_id}`)}
          />

          {!isOwner && listing.status === 'active' && (
            <View style={styles.actions}>
              <GradientButton
                label={t('listing.detail.chat_seller')}
                onPress={handleChatSeller}
                style={styles.chatButton}
                fullWidth
              />
              <IconButton
                icon={
                  <Ionicons
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorited ? colors.error : colors.textSecondary}
                  />
                }
                onPress={handleFavorite}
                size={48}
              />
              <IconButton
                icon={
                  <Ionicons name="flag-outline" size={24} color={colors.textSecondary} />
                }
                onPress={() => router.push(`/report/${listing.id}`)}
                size={48}
              />
            </View>
          )}

          {isOwner && listing.status === 'active' && !listing.is_featured && (
            <SecondaryButton
              label={t('listing.promote.promote_button')}
              onPress={() => router.push(`/promote/${listing.id}`)}
              fullWidth
            />
          )}
        </View>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  details: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  descriptionLabel: {
    ...typography.label,
    color: colors.text,
    marginTop: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  chatButton: {
    flex: 1,
  },
});
