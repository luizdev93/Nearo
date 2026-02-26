/**
 * Nearo Design System — Color tokens
 * @see rules/nearo_design_system_ux_guidelines.md
 */

/** Brand gradient: Purple → Blue → Baby Blue. Use for primary CTAs, active states. */
export const gradientPrimary = ['#7A5CFF', '#5A6BFF', '#47C2FF'] as const;

export const colors = {
  /** Solid primary (e.g. fallback when gradient not used) */
  primary: '#6A64FF',
  primaryLight: '#8B85FF',
  primaryDark: '#554EE6',

  /** Secondary accent (baby blue) — use for highlights, links */
  secondary: '#47C2FF',
  secondaryLight: '#7DD3FF',

  /** App background (light gray-blue) */
  background: '#F7F8FC',
  backgroundSecondary: '#F3F4F6',
  /** Card / surface (white) */
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',

  text: '#1A1D29',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  overlay: 'rgba(0, 0, 0, 0.5)',
  /** Dark overlay for image overlays (e.g. featured card) */
  overlayDark: 'rgba(0, 0, 0, 0.45)',

  /** Badge / featured (amber) — keep for featured listing badge */
  featured: '#F59E0B',
  sold: '#9CA3AF',
  active: '#22C55E',

  /** Icon button soft background */
  iconButtonBg: '#F1F3FF',
} as const;

export type ColorKey = keyof typeof colors;
