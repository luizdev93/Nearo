import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import i18n from '../src/localization/i18n';
import { colors, spacing, borderRadius, typography } from '../src/theme';
import { Avatar } from '../src/components/common/Avatar';
import { Button } from '../src/components/common/Button';
import { TextInput } from '../src/components/inputs/TextInput';
import { useAuthStore } from '../src/state/auth_store';
import { useUserStore } from '../src/state/user_store';
import { storageService } from '../src/services/storage_service';
import { pickImages } from '../src/utils/image';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setAuthUser = useAuthStore((s) => s.setUser);
  const { updateProfile, isLoading } = useUserStore();

  const [name, setName] = useState(user?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? null);
  const [language, setLanguage] = useState(user?.language ?? 'en');

  const handleChangePhoto = async () => {
    if (!user) return;
    const images = await pickImages(1);
    if (images.length === 0) return;

    const { data: url } = await storageService.uploadProfileImage(images[0].uri, user.id);
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
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Avatar uri={avatarUrl} name={name} size={100} />
          <TouchableOpacity onPress={handleChangePhoto}>
            <Text style={styles.changePhotoText}>{t('edit_profile.change_photo')}</Text>
          </TouchableOpacity>
        </View>

        {/* Name */}
        <TextInput
          label={t('edit_profile.name')}
          placeholder={t('edit_profile.name_placeholder')}
          value={name}
          onChangeText={setName}
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

        {/* Save */}
        <Button
          title={isLoading ? t('edit_profile.saving') : t('edit_profile.save')}
          onPress={handleSave}
          loading={isLoading}
          disabled={!name.trim()}
          size="lg"
          style={styles.saveButton}
        />
      </ScrollView>
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
