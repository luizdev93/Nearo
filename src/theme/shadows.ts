import { ViewStyle } from 'react-native';

/**
 * Nearo Design System — Elevation & shadows (soft only)
 * Card: 0 6px 18px rgba(0,0,0,0.06)
 * Floating: 0 10px 28px rgba(0,0,0,0.10)
 * @see rules/nearo_design_system_ux_guidelines.md
 */
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  } as ViewStyle,
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 8,
  } as ViewStyle,
} as const;
