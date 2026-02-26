import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';

type TabBarProps = {
  state: { routes: { name: string; key: string }[]; index: number };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
      };
    }
  >;
  navigation: { navigate: (name: string) => void; emit: (e: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean } };
};

/** Floating bottom tab bar — rounded container, gradient active state. */
export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, spacing.md);

  return (
    <View style={[styles.wrapper, { paddingBottom: bottom }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key] ?? {};
          const label = options?.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event?.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconProps = { focused: isFocused, color: isFocused ? colors.primary : colors.textTertiary, size: 24 };
          const iconNode = options?.tabBarIcon?.(iconProps);

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              {iconNode ?? (
                <Ionicons
                  name="ellipse-outline"
                  size={24}
                  color={iconProps.color}
                />
              )}
              <Text
                style={[
                  styles.label,
                  isFocused ? styles.labelActive : styles.labelInactive,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadows.floating,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    minWidth: 44,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  labelInactive: {
    color: colors.textTertiary,
    fontWeight: '500',
  },
});
