import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { ListingCard as ListingCardType } from '../../models/listing';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../state/auth_store';
import { useUserStore } from '../../state/user_store';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = spacing.lg * 2;
const CARD_WIDTH_2COL = (SCREEN_WIDTH - spacing.lg * 3) / 2;
const CARD_WIDTH_1COL = SCREEN_WIDTH - HORIZONTAL_PADDING;

const HORIZONTAL_IMAGE_WIDTH = 96;
const HORIZONTAL_IMAGE_HEIGHT = 72;

interface ListingCardProps {
  listing: ListingCardType;
  onPress?: () => void;
  /** Single column layout (full width) — e.g. Search page */
  fullWidth?: boolean;
  /** Compact horizontal layout: image left, text right — e.g. Search results */
  horizontal?: boolean;
}

export const ListingCardComponent = memo(function ListingCardComponent({
  listing,
  onPress,
  fullWidth = false,
  horizontal = false,
}: ListingCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => !!s.session);
  const isFavorited = useUserStore((s) => s.favoritedIds.has(listing.id));
  const toggleFavorite = useUserStore((s) => s.toggleFavorite);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/listing/${listing.id}`);
    }
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    toggleFavorite(listing.id);
  };

  const cardWidth = horizontal ? CARD_WIDTH_1COL : fullWidth ? CARD_WIDTH_1COL : CARD_WIDTH_2COL;
  const containerStyle = [
    styles.container,
    { width: cardWidth },
    horizontal && styles.containerHorizontal,
  ];
  const imageContainerStyle = horizontal
    ? [styles.imageContainerHorizontal, { width: HORIZONTAL_IMAGE_WIDTH, height: HORIZONTAL_IMAGE_HEIGHT }]
    : [styles.imageContainer, { aspectRatio: fullWidth ? 4 / 3 : 1 }];

  if (horizontal) {
    return (
      <TouchableOpacity style={containerStyle} onPress={handlePress} activeOpacity={0.8}>
        <View style={imageContainerStyle}>
          {listing.image_url ? (
            <Image
              source={{ uri: listing.image_url }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={24} color={colors.textTertiary} />
            </View>
          )}
          {listing.is_featured && (
            <View style={styles.badgeContainer}>
              <Badge label={t('listing.detail.featured_badge')} variant="featured" />
            </View>
          )}
        </View>
        <View style={styles.infoHorizontal}>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>
          <Text style={styles.titleHorizontal} numberOfLines={2}>
            {listing.title}
          </Text>
          {(listing.distance_km != null || listing.location_name) && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={11} color={colors.textTertiary} />
              <Text style={styles.location} numberOfLines={1}>
                {listing.distance_km != null
                  ? `${listing.distance_km.toFixed(1)} km`
                  : listing.location_name}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.favoriteButtonHorizontal} onPress={handleFavorite}>
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorited ? colors.error : colors.textSecondary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={containerStyle} onPress={handlePress} activeOpacity={0.8}>
      <View style={imageContainerStyle}>
        {listing.image_url ? (
          <Image
            source={{ uri: listing.image_url }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={colors.textTertiary} />
          </View>
        )}
        {listing.is_featured && (
          <View style={styles.badgeContainer}>
            <Badge label={t('listing.detail.featured_badge')} variant="featured" />
          </View>
        )}
        <TouchableOpacity style={styles.favoriteButton} onPress={handleFavorite}>
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorited ? colors.error : colors.textInverse}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        {(listing.distance_km != null || listing.location_name) && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.location} numberOfLines={1}>
              {listing.distance_km != null
                ? `${listing.distance_km.toFixed(1)} km away`
                : listing.location_name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  containerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
  },
  imageContainerHorizontal: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonHorizontal: {
    padding: spacing.xs,
    marginLeft: 'auto',
  },
  info: {
    padding: spacing.sm,
  },
  infoHorizontal: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    paddingLeft: 0,
  },
  price: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: 2,
  },
  titleHorizontal: {
    ...typography.bodySmall,
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  location: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
  },
});
