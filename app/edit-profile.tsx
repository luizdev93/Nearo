import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from '../src/localization/i18n';
import { colors, spacing, borderRadius, typography } from '../src/theme';
import { ScreenContainer } from '../src/components/layout/ScreenContainer';
import { Avatar } from '../src/components/common/Avatar';
import { GradientButton } from '../src/components/ui/GradientButton';
import { TextInputField } from '../src/components/form/TextInputField';
import { useAuthStore } from '../src/state/auth_store';
import { useUserStore } from '../src/state/user_store';
import { storageService } from '../src/services/storage_service';
import { pickImages } from '../src/utils/image';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setAuthUser = useAuthStore((s) => s.setUser);
  const { updateProfile, isLoading, error } = useUserStore();

  const [name, setName] = useState(user?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? null);
  const [language, setLanguage] = useState(user?.language ?? 'en');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) useUserStore.getState().setProfile(user);
  }, [user]);

  const handleChangePhoto = async () => {
    if (!user) return;
    const images = await pickImages(1);
    if (images.length === 0) return;

    setIsUploadingPhoto(true);
    const { data: url } = await storageService.uploadProfileImage(images[0].uri, user.id);
    setIsUploadingPhoto(false);
    if (url) setAvatarUrl(url);
  };

  const handleSave = async () => {
    const success = await updateProfile({
      name: name.trim(),
      avatar_url: avatarUrl ?? undefined,
      language,
    });

    if (success) {
      if (user) {
        setAuthUser({ ...user, name: name.trim(), avatar_url: avatarUrl, language });
      }
      i18n.changeLanguage(language);
      Alert.alert(t('edit_profile.success'));
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('edit_profile.title') }} />
      <ScreenContainer noPadding>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.avatarSection}>
            <Avatar uri={avatarUrl} name={name} size={100} />
            <TouchableOpacity
              onPress={handleChangePhoto}
              disabled={isUploadingPhoto}
            >
              <Text style={[styles.changePhotoText, isUploadingPhoto && styles.changePhotoDisabled]}>
                {isUploadingPhoto ? t('edit_profile.uploading_photo') : t('edit_profile.change_photo')}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInputField
            label={t('edit_profile.name')}
            placeholder={t('edit_profile.name_placeholder')}
            value={name}
            onChangeText={setName}
            error={error ?? undefined}
          />

        {/* Language */}
        <Text style={styles.label}>{t('edit_profile.language')}</Text>
        <View style={styles.languageRow}>
          <TouchableOpacity
            style={[styles.langButton, language === 'en' && styles.langButtonActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langButton, language === 'vi' && styles.langButtonActive]}
            onPress={() => setLanguage('vi')}
          >
            <Text style={[styles.langText, language === 'vi' && styles.langTextActive]}>
              Tiếng Việt
            </Text>
          </TouchableOpacity>
        </View>

          <GradientButton
            label={isLoading ? t('edit_profile.saving') : t('edit_profile.save')}
            onPress={handleSave}
            loading={isLoading}
            disabled={!name.trim()}
            fullWidth
            style={styles.saveButton}
          />
        </ScrollView>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  changePhotoText: {
    ...typography.label,
    color: colors.primary,
  },
  changePhotoDisabled: {
    color: colors.textTertiary,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  languageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  langButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  langButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  langText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  langTextActive: {
    color: colors.textInverse,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});
