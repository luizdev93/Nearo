import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { SecondaryButton } from '../ui/SecondaryButton';

interface ErrorViewProps {
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorView({ message, retryLabel = 'Retry', onRetry }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <SecondaryButton label={retryLabel} onPress={onRetry} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    gap: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
