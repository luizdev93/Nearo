import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { ScreenContainer } from '../../src/components/layout/ScreenContainer';
import { TextInputField } from '../../src/components/form/TextInputField';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { SecondaryButton } from '../../src/components/ui/SecondaryButton';
import { ListingCardComponent } from '../../src/components/cards/ListingCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingSkeletonGrid } from '../../src/components/feedback/LoadingSkeleton';
import { useListingStore } from '../../src/state/listing_store';
import { ListingFilters, ListingCondition } from '../../src/models/listing';
import { CATEGORIES, Category } from '../../src/models/category';
import { ListingCard } from '../../src/models/listing';

export default function SearchScreen() {
  const { t } = useTranslation();
  const {
    searchResults,
    searchHasMore,
    isLoading,
    isLoadingMore,
    search,
    searchMore,
    clearSearch,
  } = useListingStore();

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [tempFilters, setTempFilters] = useState<ListingFilters>({});

  const handleSearch = useCallback(() => {
    search(query, filters);
  }, [query, filters]);

  const handleLoadMore = useCallback(() => {
    searchMore(query, filters);
  }, [query, filters]);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
    search(query, tempFilters);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    setFilters({});
    setShowFilters(false);
    if (query) search(query, {});
  };

  const renderItem = ({ item }: { item: ListingCard }) => (
    <ListingCardComponent listing={item} />
  );

  const renderEmpty = () => {
    if (isLoading) return <LoadingSkeletonGrid count={6} />;
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

  const hasActiveFilters = Object.keys(filters).length > 0;

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
            iconLeft={<Ionicons name="search-outline" size={20} color={colors.textTertiary} />}
            inputStyle={styles.searchInput}
          />
        </View>
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

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, filters.category === cat && styles.categoryChipActive]}
            onPress={() => {
              const newFilters = { ...filters, category: filters.category === cat ? undefined : cat };
              setFilters(newFilters);
              search(query, newFilters);
            }}
          >
            <Text
              style={[
                styles.categoryChipText,
                filters.category === cat && styles.categoryChipTextActive,
              ]}
            >
              {t(`categories.${cat}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('search.filters')}</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Price Range */}
            <Text style={styles.filterLabel}>{t('search.filter.price_range')}</Text>
            <View style={styles.priceRow}>
              <TextInputField
                placeholder={t('search.filter.min_price')}
                value={tempFilters.min_price?.toString() ?? ''}
                onChangeText={(v) =>
                  setTempFilters({ ...tempFilters, min_price: v ? Number(v) : undefined })
                }
                keyboardType="numeric"
                inputStyle={styles.priceInput}
              />
              <Text style={styles.priceDash}>-</Text>
              <TextInputField
                placeholder={t('search.filter.max_price')}
                value={tempFilters.max_price?.toString() ?? ''}
                onChangeText={(v) =>
                  setTempFilters({ ...tempFilters, max_price: v ? Number(v) : undefined })
                }
                keyboardType="numeric"
                inputStyle={styles.priceInput}
              />
            </View>

            {/* Condition */}
            <Text style={styles.filterLabel}>{t('search.filter.condition')}</Text>
            <View style={styles.conditionRow}>
              {(['new', 'used'] as ListingCondition[]).map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.conditionButton,
                    tempFilters.condition === cond && styles.conditionActive,
                  ]}
                  onPress={() =>
                    setTempFilters({
                      ...tempFilters,
                      condition: tempFilters.condition === cond ? undefined : cond,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.conditionText,
                      tempFilters.condition === cond && styles.conditionTextActive,
                    ]}
                  >
                    {t(`listing.create.condition_${cond}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort */}
            <Text style={styles.filterLabel}>{t('search.filter.sort')}</Text>
            {(['newest', 'price_asc', 'price_desc'] as const).map((sortKey) => (
              <TouchableOpacity
                key={sortKey}
                style={[
                  styles.sortOption,
                  tempFilters.sort_by === sortKey && styles.sortOptionActive,
                ]}
                onPress={() => setTempFilters({ ...tempFilters, sort_by: sortKey })}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    tempFilters.sort_by === sortKey && styles.sortOptionTextActive,
                  ]}
                >
                  {t(`search.filter.sort_${sortKey}`)}
                </Text>
                {tempFilters.sort_by === sortKey && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <SecondaryButton
              label={t('search.filter.clear')}
              onPress={handleClearFilters}
              style={styles.modalButton}
            />
            <GradientButton
              label={t('search.filter.apply')}
              onPress={handleApplyFilters}
              style={styles.modalButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
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
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  filterLabel: {
    ...typography.label,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
  },
  priceDash: {
    ...typography.body,
    color: colors.textTertiary,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  conditionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  conditionText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  conditionTextActive: {
    color: colors.textInverse,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  sortOptionActive: {
    backgroundColor: colors.surfaceSecondary,
  },
  sortOptionText: {
    ...typography.body,
    color: colors.text,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
  },
});
