import React, { useState, useEffect } from 'react';
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
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { ScreenContainer } from '../../src/components/layout/ScreenContainer';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { useAuthStore } from '../../src/state/auth_store';
import { useListingStore } from '../../src/state/listing_store';
import { pickImages } from '../../src/utils/image';
import { getCurrentLocation } from '../../src/utils/location';
import { CreateListingInput, ListingCondition, CreateListingAttributeValues } from '../../src/models/listing';
import { LISTING_IMAGE_MAX_COUNT } from '../../src/utils/constants';
import {
  isValidListingTitle,
  isValidListingDescription,
  isValidPrice,
} from '../../src/utils/validators';
import { categoryService } from '../../src/services/category_service';
import type { Category } from '../../src/models/category_engine';
import type { CategoryTemplate } from '../../src/models/category_engine';
import { CategoryTreePicker } from '../../src/components/category/CategoryTreePicker';
import { DynamicListingForm } from '../../src/components/category/DynamicListingForm';

export default function CreateListingScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const { createListing, isCreating } = useListingStore();

  const [leafCategories, setLeafCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [template, setTemplate] = useState<CategoryTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ListingCondition>('used');
  const [negotiable, setNegotiable] = useState(false);
  const [attributeValues, setAttributeValues] = useState<CreateListingAttributeValues>({});
  const [images, setImages] = useState<string[]>([]);
  const [locationName, setLocationName] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    categoryService.getLeafCategories().then(({ data }) => {
      if (data) setLeafCategories(data);
    });
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setTemplate(null);
      setAttributeValues({});
      return;
    }
    categoryService.getTemplate(selectedCategory.id).then(({ data }) => {
      setTemplate(data ?? null);
      setAttributeValues({});
    });
  }, [selectedCategory?.id]);

  if (!session) {
    return (
      <ScreenContainer>
        <View style={styles.authPrompt}>
          <Text style={styles.authText}>{t('profile.login_required')}</Text>
          <GradientButton
            label={t('auth.login.continue')}
            onPress={() => router.push('/(auth)/login')}
            fullWidth
          />
        </View>
      </ScreenContainer>
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
    if (!selectedCategory) newErrors.category = 'Select a category';
    if (images.length === 0) newErrors.images = 'Add at least one photo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAttributeChange = (key: string, value: string | number | boolean) => {
    setAttributeValues((prev) => ({ ...prev, [key]: value }));
  };

  const handlePublish = async () => {
    if (!validate() || !user || !selectedCategory) return;

    const input: CreateListingInput = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: selectedCategory.slug,
      category_id: selectedCategory.id,
      condition,
      negotiable,
      location_lat: locationCoords?.lat,
      location_lng: locationCoords?.lng,
      location_name: locationName || undefined,
      attribute_values: Object.keys(attributeValues).length ? attributeValues : undefined,
    };

    const result = await createListing(input, images, user.id);
    if (result) {
      Alert.alert(t('listing.create.success'));
      router.back();
    }
  };

  return (
    <ScreenContainer noPadding>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
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

        <CategoryTreePicker
          categories={leafCategories}
          selectedCategoryId={selectedCategory?.id ?? null}
          onSelect={setSelectedCategory}
          label={t('listing.create.field_category')}
          error={errors.category}
        />

        <DynamicListingForm
          template={template}
          title={title}
          description={description}
          price={price}
          condition={condition}
          negotiable={negotiable}
          attributeValues={attributeValues}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onPriceChange={setPrice}
          onConditionChange={setCondition}
          onNegotiableChange={setNegotiable}
          onAttributeChange={handleAttributeChange}
          errors={errors}
          locale={i18n.language?.startsWith('vi') ? 'vi' : 'en'}
        />

        {/* Location */}
        <Text style={styles.sectionLabel}>{t('listing.create.field_location')}</Text>
        <TouchableOpacity style={styles.locationButton} onPress={handleDetectLocation}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <Text style={styles.locationText}>
            {locationName || t('listing.create.field_location')}
          </Text>
        </TouchableOpacity>

        <GradientButton
          label={isCreating ? t('listing.create.publishing') : t('listing.create.publish')}
          onPress={handlePublish}
          loading={isCreating}
          fullWidth
          style={styles.publishButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
