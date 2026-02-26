import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import type { Category } from '../../models/category_engine';

const CATEGORY_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  car: 'car-outline',
  home: 'home-outline',
  briefcase: 'briefcase-outline',
  laptop: 'laptop-outline',
  bed: 'bed-outline',
  shirt: 'shirt-outline',
  construct: 'construct-outline',
  'ellipsis-horizontal': 'ellipsis-horizontal',
};

interface CategoryTreePickerProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (category: Category) => void;
  label?: string;
  error?: string;
}

export function CategoryTreePicker({
  categories,
  selectedCategoryId,
  onSelect,
  label,
  error,
}: CategoryTreePickerProps) {
  const selected = categories.find((c) => c.id === selectedCategoryId);
  const iconKey = (selected?.icon ?? 'ellipsis-horizontal') as string;
  const iconName = CATEGORY_ICON_MAP[iconKey] ?? 'ellipsis-horizontal';

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.grid}>
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCategoryId;
          const catIcon = (cat.icon ?? 'ellipsis-horizontal') as string;
          const catIconName = CATEGORY_ICON_MAP[catIcon] ?? 'ellipsis-horizontal';
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => onSelect(cat)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={catIconName}
                size={18}
                color={isSelected ? colors.textInverse : colors.textSecondary}
              />
              <Text
                style={[styles.chipText, isSelected && styles.chipTextActive]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    maxWidth: 100,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
