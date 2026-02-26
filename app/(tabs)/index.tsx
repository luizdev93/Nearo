import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { ListingCardComponent } from '../../src/components/cards/ListingCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useListingStore } from '../../src/state/listing_store';
import { useUserStore } from '../../src/state/user_store';
import { useAuthStore } from '../../src/state/auth_store';
import { ListingCard } from '../../src/models/listing';
import { formatPrice } from '../../src/utils/formatters';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FEATURED_CARD_WIDTH = SCREEN_WIDTH * 0.65;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    featuredListings,
    feedListings,
    feedHasMore,
    isLoading,
    isLoadingMore,
    loadFeatured,
    loadFeed,
    loadMoreFeed,
  } = useListingStore();
  const session = useAuthStore((s) => s.session);
  const loadFavorites = useUserStore((s) => s.loadFavorites);

  useEffect(() => {
    loadFeatured();
    loadFeed();
    if (session) loadFavorites();
  }, []);

  const handleRefresh = useCallback(() => {
    loadFeatured();
    loadFeed();
  }, []);

  const renderFeaturedItem = ({ item }: { item: ListingCard }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => router.push(`/listing/${item.id}`)}
      activeOpacity={0.8}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.featuredImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.featuredImage, styles.featuredPlaceholder]} />
      )}
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredPrice}>{formatPrice(item.price)}</Text>
        <Text style={styles.featuredTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {featuredListings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.featured')}</Text>
          <FlatList
            data={featuredListings}
            renderItem={renderFeaturedItem}
            keyExtractor={(item) => `featured-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>
      )}
      <Text style={[styles.sectionTitle, styles.recentTitle]}>
        {t('home.recent')}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: ListingCard }) => (
    <ListingCardComponent listing={item} />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return <EmptyState icon="storefront-outline" title={t('home.empty')} />;
  };

  return (
    <FlatList
      data={feedListings}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={loadMoreFeed}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  recentTitle: {
    marginTop: spacing.sm,
  },
  featuredList: {
    gap: spacing.md,
  },
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    height: FEATURED_CARD_WIDTH * 0.65,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredPlaceholder: {
    backgroundColor: colors.backgroundSecondary,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  featuredPrice: {
    ...typography.label,
    color: colors.textInverse,
    fontWeight: '700',
  },
  featuredTitle: {
    ...typography.bodySmall,
    color: colors.textInverse,
    marginTop: 2,
  },
  row: {
    justifyContent: 'space-between',
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
});
