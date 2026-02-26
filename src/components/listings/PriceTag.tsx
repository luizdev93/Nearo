import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { typography } from '../../theme';
import { colors } from '../../theme';
interface PriceTagProps {
  price: number;
  currency?: string;
}

/** Highlight price — bold, prominent. */
export function PriceTag({ price, currency = 'USD' }: PriceTagProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return <Text style={styles.price}>{formatted}</Text>;
}

const styles = StyleSheet.create({
  price: {
    ...typography.price,
    color: colors.text,
  },
});
