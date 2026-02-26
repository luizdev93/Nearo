import React, { useEffect, useCallback, useState } from 'react';
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
import { Image } from 'expo-image';
import { ScreenContainer } from '../../src/components/layout/ScreenContainer';
import { SectionHeader } from '../../src/components/layout/SectionHeader';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { ListingCardComponent } from '../../src/components/cards/ListingCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingSkeletonGrid } from '../../src/components/feedback/LoadingSkeleton';
import { useListingStore } from '../../src/state/listing_store';
import { useUserStore } from '../../src/state/user_store';
import { useAuthStore } from '../../src/state/auth_store';
import { ListingCard, ListingFilters } from '../../src/models/listing';
import { formatPrice } from '../../src/utils/formatters';
import { categoryService } from '../../src/services/category_service';
import type { Category } from '../../src/models/category_engine';
import { getCurrentLocation } from '../../src/utils/location';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FEATURED_CARD_WIDTH = SCREEN_WIDTH * 0.65;

type FeedTab = 'recent' | 'near';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    featuredListings,
    feedListings,
    feedFilters,
    feedHasMore,
    isLoading,
    isLoadingMore,
    loadFeatured,
    loadFeed,
    loadMoreFeed,
  } = useListingStore();
  const session = useAuthStore((s) => s.session);
  const loadFavorites = useUserStore((s) => s.loadFavorites);

  const [feedTab, setFeedTab] = useState<FeedTab>('recent');
  const [leafCategories, setLeafCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    categoryService.getLeafCategories().then(({ data }) => {
      if (data) setLeafCategories(data);
    });
  }, []);

  useEffect(() => {
    getCurrentLocation().then((coords) => {
      if (coords) setUserLocation({ lat: coords.latitude, lng: coords.longitude });
    });
  }, []);

  useEffect(() => {
    loadFeatured();
    loadFeed();
    if (session) loadFavorites();
  }, []);

  useEffect(() => {
    if (feedTab === 'near' && userLocation) {
      loadFeed({
        location_lat: userLocation.lat,
        location_lng: userLocation.lng,
        radius_km: 25,
        sort_by: 'nearest',
      });
    } else if (feedTab === 'recent' && selectedCategoryId) {
      const cat = leafCategories.find((c) => c.id === selectedCategoryId);
      loadFeed(cat ? { category_id: selectedCategoryId, category: cat.slug } : undefined);
    } else if (feedTab === 'recent' && !selectedCategoryId) {
      loadFeed();
    }
  }, [feedTab, selectedCategoryId, userLocation, leafCategories]);

  const handleRefresh = useCallback(() => {
    loadFeatured();
    if (feedTab === 'near' && userLocation) {
      loadFeed({
        location_lat: userLocation.lat,
        location_lng: userLocation.lng,
        radius_km: 25,
        sort_by: 'nearest',
      });
    } else if (selectedCategoryId) {
      const cat = leafCategories.find((c) => c.id === selectedCategoryId);
      loadFeed(cat ? { category_id: selectedCategoryId, category: cat.slug } : undefined);
    } else {
      loadFeed();
    }
  }, [feedTab, selectedCategoryId, userLocation, leafCategories]);

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

  const handleTabChange = (tab: FeedTab) => {
    setFeedTab(tab);
    if (tab === 'recent') setSelectedCategoryId(null);
  };

  const renderHeader = () => (
    <View>
      {featuredListings.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title={t('home.featured')} />
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
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, feedTab === 'recent' && styles.tabActive]}
          onPress={() => handleTabChange('recent')}
        >
          <Text style={[styles.tabText, feedTab === 'recent' && styles.tabTextActive]}>
            {t('home.recent', 'Recent')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, feedTab === 'near' && styles.tabActive]}
          onPress={() => handleTabChange('near')}
        >
          <Text style={[styles.tabText, feedTab === 'near' && styles.tabTextActive]}>
            {t('home.near_me', 'Near me')}
          </Text>
        </TouchableOpacity>
      </View>
      {feedTab === 'recent' && leafCategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategoryId && styles.categoryChipActive]}
            onPress={() => setSelectedCategoryId(null)}
          >
            <Text style={[styles.categoryChipText, !selectedCategoryId && styles.categoryChipTextActive]}>
              {t('search.filter.category', 'All')}
            </Text>
          </TouchableOpacity>
          {leafCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategoryId(isSelected ? null : cat.id)}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      <SectionHeader title={feedTab === 'near' ? t('home.near_me', 'Near me') : t('home.recent', 'Recent')} />
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
    if (isLoading) return <LoadingSkeletonGrid count={6} />;
    return <EmptyState icon="storefront-outline" title={t('home.empty')} />;
  };

  return (
    <ScreenContainer noPadding>
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
    </ScreenContainer>
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
    backgroundColor: colors.overlayDark,
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textInverse,
  },
  categoryScroll: {
    maxHeight: 40,
    marginBottom: spacing.sm,
  },
  categoryContent: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.textInverse,
  },
  row: {
    justifyContent: 'space-between',
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
});
