import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { ScreenContainer } from '../../src/components/layout/ScreenContainer';
import { TextInputField } from '../../src/components/form/TextInputField';
import { ListingCardComponent } from '../../src/components/cards/ListingCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingSkeletonGrid } from '../../src/components/feedback/LoadingSkeleton';
import { useListingStore } from '../../src/state/listing_store';
import { ListingFilters } from '../../src/models/listing';
import { ListingCard } from '../../src/models/listing';
import { categoryService } from '../../src/services/category_service';
import type { Category } from '../../src/models/category_engine';
import type { CategoryTemplate } from '../../src/models/category_engine';
import { DynamicFilterPanel } from '../../src/components/category/DynamicFilterPanel';
import { getCurrentLocation } from '../../src/utils/location';
import { getSuggestedCategoriesForQuery } from '../../src/utils/search_keywords';

export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const {
    searchResults,
    searchHasMore,
    isLoading,
    isLoadingMore,
    search,
    searchMore,
    clearSearch,
  } = useListingStore();

  const [leafCategories, setLeafCategories] = useState<Category[]>([]);
  const [filterTemplate, setFilterTemplate] = useState<CategoryTemplate | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [tempFilters, setTempFilters] = useState<ListingFilters>({});

  useEffect(() => {
    categoryService.getLeafCategories().then(({ data }) => {
      if (data) setLeafCategories(data);
    });
  }, []);

  useEffect(() => {
    if (!filters.category_id) {
      setFilterTemplate(null);
      return;
    }
    categoryService.getTemplate(filters.category_id).then(({ data }) => {
      setFilterTemplate(data ?? null);
    });
  }, [filters.category_id]);

  useEffect(() => {
    getCurrentLocation().then((coords) => {
      if (coords) setUserLocation({ lat: coords.latitude, lng: coords.longitude });
    });
  }, []);

  const handleSearch = useCallback(() => {
    search(query, filters);
  }, [query, filters]);

  const handleLoadMore = useCallback(() => {
    searchMore(query, filters);
  }, [query, filters]);

  const handleApplyFilters = () => {
    const applied: ListingFilters = { ...tempFilters };
    if ((tempFilters.radius_km != null || tempFilters.sort_by === 'nearest' || tempFilters.sort_by === 'farthest') && userLocation) {
      applied.location_lat = userLocation.lat;
      applied.location_lng = userLocation.lng;
      if (tempFilters.radius_km != null) applied.radius_km = tempFilters.radius_km;
    }
    setFilters(applied);
    setShowFilters(false);
    search(query, applied);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    setFilters({});
    setShowFilters(false);
    if (query) search(query, {});
  };

  const suggestedCategories = useMemo(() => {
    const cats = leafCategories.map((c) => ({ slug: c.slug, name: c.name }));
    return getSuggestedCategoriesForQuery(query, cats);
  }, [query, leafCategories]);

  const handleSuggestionTap = useCallback(
    (slug: string) => {
      const cat = leafCategories.find((c) => c.slug === slug);
      if (!cat) return;
      const newFilters: ListingFilters = {
        ...filters,
        category_id: cat.id,
        category: cat.slug,
      };
      setFilters(newFilters);
      search(query, newFilters);
    },
    [query, filters, leafCategories, search],
  );

  const renderItem = ({ item }: { item: ListingCard }) => (
    <ListingCardComponent listing={item} fullWidth />
  );

  const renderEmpty = () => {
    if (isLoading) return <LoadingSkeletonGrid count={6} fullWidth />;
    if (!query && searchResults.length === 0) {
      return (
        <EmptyState
          icon="search-outline"
          title={t('search.placeholder')}
        />
      );
    }
    return <EmptyState icon="search-outline" title={t('search.no_results')} />;
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const hasActiveFilters =
    (filters.category_id ?? filters.category) != null ||
    filters.min_price != null ||
    filters.max_price != null ||
    filters.condition != null ||
    filters.negotiable === true ||
    filters.radius_km != null ||
    (filters.attribute_filters && Object.keys(filters.attribute_filters).length > 0) ||
    (filters.sort_by != null && filters.sort_by !== 'newest');

  const filterChipLabel = (): string[] => {
    const labels: string[] = [];
    const cat = leafCategories.find((c) => c.id === filters.category_id);
    if (cat) labels.push(cat.name);
    if (filters.min_price != null) labels.push(`Min ${filters.min_price}`);
    if (filters.max_price != null) labels.push(`Max ${filters.max_price}`);
    if (filters.condition) labels.push(filters.condition === 'new' ? 'New' : 'Used');
    if (filters.negotiable) labels.push('Negotiable');
    if (filters.radius_km != null) labels.push(`${filters.radius_km} km`);
    if (filters.attribute_filters) {
      for (const [k, v] of Object.entries(filters.attribute_filters)) {
        if (v !== undefined && v !== null && v !== '') labels.push(`${k}: ${v}`);
      }
    }
    if (filters.sort_by && filters.sort_by !== 'newest') labels.push(`Sort: ${filters.sort_by}`);
    return labels;
  };

  return (
    <ScreenContainer noPadding>
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrapper}>
          <TextInputField
            placeholder={t('search.placeholder')}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            size="large"
            iconLeft={<Ionicons name="search-outline" size={22} color={colors.textTertiary} />}
            inputStyle={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={colors.textInverse} />
          <Text style={styles.searchButtonText}>{t('search.search', 'Search')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => {
            setTempFilters(filters);
            setShowFilters(true);
          }}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={hasActiveFilters ? colors.textInverse : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Category suggestion chips — e.g. "Search iPhone in Electronics" */}
      {query.trim().length >= 2 && suggestedCategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionScroll}
          contentContainerStyle={styles.suggestionContent}
        >
          {suggestedCategories.map((s) => (
            <TouchableOpacity
              key={s.slug}
              style={styles.suggestionChip}
              onPress={() => handleSuggestionTap(s.slug)}
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={14} color={colors.primary} />
              <Text style={styles.suggestionChipText} numberOfLines={1}>
                {t('search.in_category', {
                  query: query.trim(),
                  category: s.name,
                  defaultValue: `{{query}} in {{category}}`,
                })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {leafCategories.map((cat) => {
          const isSelected = filters.category_id === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
              onPress={() => {
                const newFilters: ListingFilters = {
                  ...filters,
                  category_id: isSelected ? undefined : cat.id,
                  category: isSelected ? undefined : cat.slug,
                  attribute_filters: isSelected ? undefined : filters.attribute_filters,
                };
                setFilters(newFilters);
                search(query, newFilters);
              }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filter chips */}
      {filterChipLabel().length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {filterChipLabel().map((label, i) => (
            <View key={i} style={styles.filterChip}>
              <Text style={styles.filterChipText} numberOfLines={1}>
                {label}
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.clearChip} onPress={handleClearFilters}>
            <Text style={styles.clearChipText}>{t('search.filter.clear')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Results */}
      <FlatList
        key="search-results-single-col"
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={1}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      <DynamicFilterPanel
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        template={filterTemplate}
        tempFilters={tempFilters}
        onTempFiltersChange={setTempFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        locale={i18n.language?.startsWith('vi') ? 'vi' : 'en'}
        filterLabel={t('search.filters')}
        applyLabel={t('search.filter.apply')}
        clearLabel={t('search.filter.clear')}
        sortOptions={[
          { key: 'newest', label: t('search.filter.sort_newest') },
          { key: 'price_asc', label: t('search.filter.sort_price_low') },
          { key: 'price_desc', label: t('search.filter.sort_price_high') },
          { key: 'nearest', label: t('search.filter.sort_nearest', 'Nearest') },
          { key: 'farthest', label: t('search.filter.sort_farthest', 'Farthest') },
        ]}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: colors.surfaceSecondary,
    minHeight: 52,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 52,
    minWidth: 80,
    borderRadius: borderRadius.button,
    backgroundColor: colors.primary,
  },
  searchButtonText: {
    ...typography.button,
    color: colors.textInverse,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  suggestionScroll: {
    maxHeight: 44,
    marginBottom: spacing.sm,
  },
  suggestionContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionChipText: {
    ...typography.caption,
    color: colors.text,
    maxWidth: 200,
  },
  categoryScroll: {
    maxHeight: 40,
    marginBottom: spacing.sm,
  },
  categoryContent: {
    paddingHorizontal: spacing.lg,
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
  chipsScroll: {
    maxHeight: 40,
    marginBottom: spacing.sm,
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    maxWidth: 120,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  clearChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearChipText: {
    ...typography.caption,
    color: colors.primary,
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
});
