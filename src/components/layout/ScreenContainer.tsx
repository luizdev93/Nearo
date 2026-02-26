import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
  noPadding?: boolean;
}

/** Base wrapper for every screen — SafeArea + background + 16px padding. */
export function ScreenContainer({
  children,
  edges = ['top', 'left', 'right'],
  style,
  noPadding,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <View style={[styles.inner, noPadding && styles.noPadding]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    padding: spacing.lg,
  },
  noPadding: {
    padding: 0,
  },
});
