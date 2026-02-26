import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  style?: ViewStyle;
}

/** Generic card container — radius 18, soft shadow, padding 12–16. */
export function Card({ children, padding = spacing.lg, style }: CardProps) {
  return <View style={[styles.card, { padding }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    ...shadows.card,
  },
});
