import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  iconLeft?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

/** Secondary action — white background, 1px border #E5E7EB. */
export function SecondaryButton({
  label,
  onPress,
  iconLeft,
  fullWidth,
  style,
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, fullWidth && styles.fullWidth, style]}
    >
      {iconLeft ? <View style={styles.iconLeft}>{iconLeft}</View> : null}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  label: {
    ...typography.button,
    color: colors.text,
  },
});
