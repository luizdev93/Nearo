import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { Button } from '../../src/components/common/Button';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { useListingStore } from '../../src/state/listing_store';

export default function PromoteListingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentListing, loadListing, promoteListing, isLoading } = useListingStore();
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    if (id) loadListing(id);
  }, [id]);

  const handlePromote = async () => {
    if (!id) return;
    setIsPromoting(true);
    const success = await promoteListing(id);
    setIsPromoting(false);

    if (success) {
      Alert.alert(t('listing.create.success'));
      router.back();
    }
  };

  if (isLoading || !currentListing) return <LoadingScreen />;

  if (currentListing.is_featured) {
    return (
      <>
        <Stack.Screen options={{ title: t('listing.promote.title') }} />
        <View style={styles.container}>
          <Ionicons name="star" size={48} color={colors.featured} />
          <Text style={styles.alreadyFeatured}>
            {t('listing.promote.already_featured')}
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('listing.promote.title') }} />
      <View style={styles.container}>
        <Ionicons name="rocket-outline" size={64} color={colors.primary} />
        <Text style={styles.title}>{t('listing.promote.title')}</Text>
        <Text style={styles.listingTitle}>{currentListing.title}</Text>
        <Text style={styles.description}>{t('listing.promote.description')}</Text>

        <Button
          title={t('listing.promote.promote_button')}
          onPress={handlePromote}
          loading={isPromoting}
          size="lg"
          style={styles.button}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  listingTitle: {
    ...typography.h3,
    color: colors.primary,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  alreadyFeatured: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.xl,
    width: '100%',
  },
});
