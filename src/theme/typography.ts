import { TextStyle } from 'react-native';

/**
 * Nearo Design System — Typography
 * Font: Inter. Hierarchy: H1 28 Bold, H2 22 SemiBold, H3 18 SemiBold, Body 16, Caption 13.
 * @see rules/nearo_design_system_ux_guidelines.md
 */
export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
} as const;
