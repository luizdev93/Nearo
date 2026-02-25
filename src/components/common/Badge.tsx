import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'featured' | 'sold' | 'info';
}

export function Badge({ label, variant = 'info' }: BadgeProps) {
  return (
    <View style={[styles.container, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  featured: {
    backgroundColor: colors.featured,
  },
  sold: {
    backgroundColor: colors.sold,
  },
  info: {
    backgroundColor: colors.info,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
  featuredText: {
    color: colors.textInverse,
  },
  soldText: {
    color: colors.textInverse,
  },
  infoText: {
    color: colors.textInverse,
  },
});
