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

const CARD_WIDTH = (Dimensions.get('window').width - spacing.lg * 3) / 2;

interface ListingCardProps {
  listing: ListingCardType;
  onPress?: () => void;
}

export const ListingCardComponent = memo(function ListingCardComponent({
  listing,
  onPress,
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

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
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
        {listing.location_name && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.location} numberOfLines={1}>
              {listing.location_name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH,
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
  info: {
    padding: spacing.sm,
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
