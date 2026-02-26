import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  icon = 'albums-outline',
  title,
  subtitle,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  const desc = description ?? subtitle;
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      {desc ? <Text style={styles.subtitle}>{desc}</Text> : null}
      {actionLabel && onActionPress ? (
        <TouchableOpacity style={styles.actionButton} onPress={onActionPress} activeOpacity={0.8}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  title: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabel: {
    ...typography.label,
    color: colors.primary,
  },
});
