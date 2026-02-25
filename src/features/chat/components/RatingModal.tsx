import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../../theme';
import { Button } from '../../../components/common/Button';
import { ratingService } from '../../../services/rating_service';
import { RATING_MAX } from '../../../utils/constants';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  raterId: string;
  ratedUserId: string;
  chatId: string;
}

export function RatingModal({
  visible,
  onClose,
  raterId,
  ratedUserId,
  chatId,
}: RatingModalProps) {
  const { t } = useTranslation();
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedRating === 0) return;
    setIsSubmitting(true);

    const { error } = await ratingService.submitRating(
      raterId,
      ratedUserId,
      chatId,
      selectedRating,
    );

    setIsSubmitting(false);

    if (error) {
      if (error.includes('unique') || error.includes('duplicate')) {
        Alert.alert(t('rating.already_rated'));
      }
    } else {
      Alert.alert(t('rating.success'));
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('rating.title')}</Text>

          <View style={styles.starsRow}>
            {Array.from({ length: RATING_MAX }, (_, i) => i + 1).map((star) => (
              <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                <Ionicons
                  name={star <= selectedRating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= selectedRating ? colors.featured : colors.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              title={t('common.cancel')}
              onPress={onClose}
              variant="ghost"
              size="sm"
            />
            <Button
              title={t('rating.submit')}
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={selectedRating === 0}
              size="sm"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  content: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
