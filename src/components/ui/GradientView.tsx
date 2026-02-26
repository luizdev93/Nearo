import React from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradientPrimary } from '../../theme';

interface GradientViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Reusable gradient container using Nearo brand gradient. */
export function GradientView({ children, style }: GradientViewProps) {
  return (
    <LinearGradient
      colors={[...gradientPrimary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
