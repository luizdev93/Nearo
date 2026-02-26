/**
 * Nearo Design System — Spacing and radius
 * Base unit: 4px. Screen padding: 16px.
 * @see rules/nearo_design_system_ux_guidelines.md
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

/** Corner radius tokens — DS: buttons 14, cards 18, inputs 12, modal 24, bubble 20 */
export const borderRadius = {
  sm: 4,
  md: 8,
  /** Inputs */
  input: 12,
  lg: 12,
  /** Buttons (primary/secondary) */
  button: 14,
  /** Cards, listing cards */
  card: 18,
  xl: 16,
  /** Chat bubbles */
  bubble: 20,
  /** Modal top corners */
  modal: 24,
  full: 9999,
} as const;
