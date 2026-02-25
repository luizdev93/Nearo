import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { Button } from '../../src/components/common/Button';
import { TextInput } from '../../src/components/inputs/TextInput';
import { useAuthStore } from '../../src/state/auth_store';
import { useListingStore } from '../../src/state/listing_store';
import { pickImages } from '../../src/utils/image';
import { getCurrentLocation } from '../../src/utils/location';
import { CreateListingInput, ListingCondition } from '../../src/models/listing';
import { CATEGORIES, Category, CATEGORY_ICONS } from '../../src/models/category';
import { LISTING_IMAGE_MAX_COUNT } from '../../src/utils/constants';
import {
  isValidListingTitle,
  isValidListingDescription,
  isValidPrice,
} from '../../src/utils/validators';

export default function CreateListingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const { createListing, isCreating } = useListingStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [condition, setCondition] = useState<ListingCondition>('used');
  const [negotiable, setNegotiable] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [locationName, setLocationName] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.authPrompt}>
          <Text style={styles.authText}>{t('profile.login_required')}</Text>
          <Button
            title={t('auth.login.continue')}
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handlePickImages = async () => {
    const remaining = LISTING_IMAGE_MAX_COUNT - images.length;
    if (remaining <= 0) return;
    const picked = await pickImages(remaining);
    setImages((prev) => [...prev, ...picked.map((p) => p.uri)]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDetectLocation = async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      setLocationCoords({ lat: coords.latitude, lng: coords.longitude });
      setLocationName(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!isValidListingTitle(title)) newErrors.title = 'Title must be 3-100 characters';
    if (!isValidListingDescription(description)) newErrors.description = 'Description must be 10-2000 characters';
    if (!isValidPrice(Number(price))) newErrors.price = 'Enter a valid price';
    if (!category) newErrors.category = 'Select a category';
    if (images.length === 0) newErrors.images = 'Add at least one photo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validate() || !user) return;

    const input: CreateListingInput = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      condition,
      negotiable,
      location_lat: locationCoords?.lat,
      location_lng: locationCoords?.lng,
      location_name: locationName || undefined,
    };

    const result = await createListing(input, images, user.id);
    if (result) {
      Alert.alert(t('listing.create.success'));
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Images */}
        <Text style={styles.sectionLabel}>{t('listing.create.field_images')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {images.map((uri, index) => (
            <View key={uri} style={styles.imageThumb}>
              <Image source={{ uri }} style={styles.thumbImage} contentFit="cover" />
              <TouchableOpacity
                style={styles.removeImage}
                onPress={() => handleRemoveImage(index)}
              >
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < LISTING_IMAGE_MAX_COUNT && (
            <TouchableOpacity style={styles.addImageButton} onPress={handlePickImages}>
              <Ionicons name="camera-outline" size={28} color={colors.textTertiary} />
              <Text style={styles.addImageText}>{t('listing.create.add_photos')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}

        {/* Title */}
        <TextInput
          label={t('listing.create.field_title')}
          placeholder={t('listing.create.field_title_placeholder')}
          value={title}
          onChangeText={setTitle}
          error={errors.title}
        />

        {/* Description */}
        <TextInput
          label={t('listing.create.field_description')}
          placeholder={t('listing.create.field_description_placeholder')}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.textArea}
          error={errors.description}
        />

        {/* Price */}
        <TextInput
          label={t('listing.create.field_price')}
          placeholder={t('listing.create.field_price_placeholder')}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          error={errors.price}
        />

        {/* Category */}
        <Text style={styles.sectionLabel}>{t('listing.create.field_category')}</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Ionicons
                name={CATEGORY_ICONS[cat] as any}
                size={16}
                color={category === cat ? colors.textInverse : colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextActive,
                ]}
              >
                {t(`categories.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

        {/* Condition */}
        <Text style={styles.sectionLabel}>{t('listing.create.field_condition')}</Text>
        <View style={styles.conditionRow}>
          <TouchableOpacity
            style={[styles.conditionButton, condition === 'new' && styles.conditionActive]}
            onPress={() => setCondition('new')}
          >
            <Text
              style={[styles.conditionText, condition === 'new' && styles.conditionTextActive]}
            >
              {t('listing.create.condition_new')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.conditionButton, condition === 'used' && styles.conditionActive]}
            onPress={() => setCondition('used')}
          >
            <Text
              style={[styles.conditionText, condition === 'used' && styles.conditionTextActive]}
            >
              {t('listing.create.condition_used')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Negotiable */}
        <View style={styles.switchRow}>
          <Text style={styles.sectionLabel}>{t('listing.create.field_negotiable')}</Text>
          <Switch
            value={negotiable}
            onValueChange={setNegotiable}
            trackColor={{ true: colors.primary }}
          />
        </View>

        {/* Location */}
        <Text style={styles.sectionLabel}>{t('listing.create.field_location')}</Text>
        <TouchableOpacity style={styles.locationButton} onPress={handleDetectLocation}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <Text style={styles.locationText}>
            {locationName || t('listing.create.field_location')}
          </Text>
        </TouchableOpacity>

        {/* Publish */}
        <Button
          title={isCreating ? t('listing.create.publishing') : t('listing.create.publish')}
          onPress={handlePublish}
          loading={isCreating}
          size="lg"
          style={styles.publishButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    gap: spacing.lg,
  },
  authText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.text,
  },
  imageRow: {
    flexDirection: 'row',
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    position: 'relative',
  },
  thumbImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  removeImage: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  publishButton: {
    marginTop: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: -spacing.sm,
  },
});
