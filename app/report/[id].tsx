import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import { ScreenContainer } from '../../src/components/layout/ScreenContainer';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { useAuthStore } from '../../src/state/auth_store';
import { reportService } from '../../src/services/report_service';
import { ReportReason } from '../../src/models/report';

const REASONS: ReportReason[] = ['spam', 'scam', 'illegal', 'other'];

export default function ReportScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason || !user || !id) return;
    setIsSubmitting(true);

    const { error } = await reportService.submitReport(user.id, {
      listing_id: id,
      reason: selectedReason,
    });

    setIsSubmitting(false);

    if (!error) {
      Alert.alert(t('report.success'));
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('report.title') }} />
      <ScreenContainer>
        <Text style={styles.title}>{t('report.title')}</Text>

        <View style={styles.reasons}>
          {REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonItem,
                selectedReason === reason && styles.reasonItemActive,
              ]}
              onPress={() => setSelectedReason(reason)}
            >
              <Ionicons
                name={
                  selectedReason === reason
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={22}
                color={selectedReason === reason ? colors.primary : colors.textTertiary}
              />
              <Text
                style={[
                  styles.reasonText,
                  selectedReason === reason && styles.reasonTextActive,
                ]}
              >
                {t(`report.reason_${reason}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <GradientButton
          label={t('report.submit')}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!selectedReason}
          fullWidth
          style={styles.submitButton}
        />
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  reasons: {
    gap: spacing.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSecondary,
  },
  reasonText: {
    ...typography.body,
    color: colors.text,
  },
  reasonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});
