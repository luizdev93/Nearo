import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from '../../theme';
import { formatPrice } from '../../utils/formatters';

interface PriceLabelProps {
  price: number;
  style?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceLabel({ price, style, size = 'md' }: PriceLabelProps) {
  return (
    <Text style={[styles.price, styles[size], style]}>
      {formatPrice(price)}
    </Text>
  );
}

const styles = StyleSheet.create({
  price: {
    color: colors.primary,
    fontWeight: '700',
  },
  sm: {
    fontSize: 14,
  },
  md: {
    ...typography.price,
  },
  lg: {
    fontSize: 24,
    fontWeight: '700',
  },
});
