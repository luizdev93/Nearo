export const colors = {
  primary: '#2563EB',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',

  secondary: '#F59E0B',
  secondaryLight: '#FCD34D',

  background: '#FFFFFF',
  backgroundSecondary: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',

  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  overlay: 'rgba(0, 0, 0, 0.5)',

  featured: '#F59E0B',
  sold: '#9CA3AF',
  active: '#10B981',
} as const;

export type ColorKey = keyof typeof colors;
