import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../src/theme';
import { ListingCardComponent } from '../src/components/cards/ListingCard';
import { EmptyState } from '../src/components/common/EmptyState';
import { LoadingScreen } from '../src/components/common/LoadingScreen';
import { useUserStore } from '../src/state/user_store';
import { ListingCard } from '../src/models/listing';

export default function FavoritesScreen() {
  const { t } = useTranslation();
  const { favorites, isLoading, loadFavorites } = useUserStore();

  useEffect(() => {
    loadFavorites();
  }, []);

  const renderItem = ({ item }: { item: ListingCard }) => (
    <ListingCardComponent listing={item} />
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="heart-outline"
        title={t('favorites.empty')}
      />
    );
  };

  if (isLoading && favorites.length === 0) return <LoadingScreen />;

  return (
    <>
      <Stack.Screen options={{ title: t('favorites.title') }} />
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
});
