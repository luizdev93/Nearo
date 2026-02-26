import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../../theme';

const DEFAULT_SIZE = 44;

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}

/** Small icon-only action — circular, soft background #F1F3FF. */
export function IconButton({ icon, onPress, size = DEFAULT_SIZE, style }: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, { width: size, height: size, borderRadius: size / 2 }, style]}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.iconButtonBg,
  },
});
