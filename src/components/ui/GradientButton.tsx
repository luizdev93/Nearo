import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradientPrimary } from '../../theme';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

/** Primary CTA button — gradient, 52px height, 14px radius. */
export function GradientButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  iconLeft,
  fullWidth,
  style,
}: GradientButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}
      style={[styles.touchable, fullWidth && styles.fullWidth, style]}
    >
      <LinearGradient
        colors={[...gradientPrimary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, isDisabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.textInverse} size="small" />
        ) : (
          <>
            {iconLeft ? <View style={styles.iconLeft}>{iconLeft}</View> : null}
            <Text style={styles.label}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  gradient: {
    height: 52,
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    minWidth: 120,
  },
  disabled: {
    opacity: 0.6,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  label: {
    ...typography.button,
    color: colors.textInverse,
  },
});
