import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { TextInputField } from '../form/TextInputField';
import { colors, spacing, borderRadius, typography } from '../../theme';
import type {
  CategoryTemplate,
  CategoryTemplateAttribute,
} from '../../models/category_engine';
import type { ListingFilters, AttributeFilterValues, ListingCondition } from '../../models/listing';

function getLabel(attr: CategoryTemplateAttribute, locale: 'en' | 'vi' = 'en'): string {
  return (locale === 'vi' ? attr.label_vi : attr.label_en) ?? attr.key;
}

interface DynamicFilterPanelProps {
  visible: boolean;
  onClose: () => void;
  template: CategoryTemplate | null;
  tempFilters: ListingFilters;
  onTempFiltersChange: (f: ListingFilters) => void;
  onApply: () => void;
  onClear: () => void;
  locale?: 'en' | 'vi';
  filterLabel?: string;
  applyLabel?: string;
  clearLabel?: string;
  sortOptions?: Array<{ key: ListingFilters['sort_by']; label: string }>;
}

export function DynamicFilterPanel({
  visible,
  onClose,
  template,
  tempFilters,
  onTempFiltersChange,
  onApply,
  onClear,
  locale = 'en',
  filterLabel = 'Filters',
  applyLabel = 'Apply',
  clearLabel = 'Clear all',
  sortOptions = [
    { key: 'newest', label: 'Newest' },
    { key: 'price_asc', label: 'Price: Low to High' },
    { key: 'price_desc', label: 'Price: High to Low' },
    { key: 'nearest', label: 'Nearest' },
    { key: 'farthest', label: 'Farthest' },
  ],
}: DynamicFilterPanelProps) {
  const [selectModalKey, setSelectModalKey] = useState<string | null>(null);

  const filterableAttrs = template?.attributes.filter((a) => a.filterable) ?? [];
  const activeAttr = filterableAttrs.find((a) => a.key === selectModalKey);
  const attrFilters = tempFilters.attribute_filters ?? {};
  const activeOptions = activeAttr
    ? activeAttr.depends_on
      ? (attrFilters[activeAttr.depends_on] != null
          ? activeAttr.options.filter(
              (o) =>
                String(o.parent_value ?? '') === String(attrFilters[activeAttr.depends_on!]),
            )
          : [])
      : activeAttr.options
    : [];

  const canShowDependent = (attr: CategoryTemplateAttribute): boolean => {
    if (!attr.depends_on) return true;
    const parentVal = attrFilters[attr.depends_on];
    return parentVal !== undefined && parentVal !== null && parentVal !== '';
  };

  const setAttrFilter = (key: string, value: string | number | boolean | { min?: number; max?: number }) => {
    const next = { ...(tempFilters.attribute_filters ?? {}), [key]: value };
    if (value === undefined || value === null || value === '') {
      delete next[key];
    }
    onTempFiltersChange({ ...tempFilters, attribute_filters: Object.keys(next).length ? next : undefined });
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{filterLabel}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Price range</Text>
            <View style={styles.priceRow}>
              <TextInputField
                placeholder="Min"
                value={tempFilters.min_price?.toString() ?? ''}
                onChangeText={(v) =>
                  onTempFiltersChange({
                    ...tempFilters,
                    min_price: v ? Number(v) : undefined,
                  })
                }
                keyboardType="numeric"
                inputStyle={styles.priceInput}
              />
              <Text style={styles.dash}>–</Text>
              <TextInputField
                placeholder="Max"
                value={tempFilters.max_price?.toString() ?? ''}
                onChangeText={(v) =>
                  onTempFiltersChange({
                    ...tempFilters,
                    max_price: v ? Number(v) : undefined,
                  })
                }
                keyboardType="numeric"
                inputStyle={styles.priceInput}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Condition</Text>
            <View style={styles.conditionRow}>
              {(['new', 'used'] as ListingCondition[]).map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.conditionBtn,
                    tempFilters.condition === cond && styles.conditionActive,
                  ]}
                  onPress={() =>
                    onTempFiltersChange({
                      ...tempFilters,
                      condition: tempFilters.condition === cond ? undefined : cond,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.conditionText,
                      tempFilters.condition === cond && styles.conditionTextActive,
                    ]}
                  >
                    {cond === 'new' ? 'New' : 'Used'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.sectionLabel}>Negotiable only</Text>
            <Switch
              value={tempFilters.negotiable ?? false}
              onValueChange={(v) => onTempFiltersChange({ ...tempFilters, negotiable: v || undefined })}
              trackColor={{ true: colors.primary }}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Distance (radius)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.radiusRow}>
              {[1, 5, 10, 25, 50, 100, 500].map((km) => (
                <TouchableOpacity
                  key={km}
                  style={[
                    styles.radiusChip,
                    tempFilters.radius_km === km && styles.radiusChipActive,
                  ]}
                  onPress={() =>
                    onTempFiltersChange({
                      ...tempFilters,
                      radius_km: tempFilters.radius_km === km ? undefined : km,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.radiusChipText,
                      tempFilters.radius_km === km && styles.radiusChipTextActive,
                    ]}
                  >
                    {km} km
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.radiusHint}>Requires location access for “Near me” and sort by distance.</Text>
          </View>

          {filterableAttrs.map((attr) => {
            if (!canShowDependent(attr)) return null;
            const label = getLabel(attr, locale);
            const value = attrFilters[attr.key];

            if (attr.type === 'select') {
              const displayVal =
                attr.options.find((o) => o.value === value)?.label_en ?? value ?? 'Any';
              return (
                <View key={attr.key} style={styles.section}>
                  <Text style={styles.sectionLabel}>{label}</Text>
                  <TouchableOpacity
                    style={styles.selectTouch}
                    onPress={() => setSelectModalKey(attr.key)}
                  >
                    <Text style={styles.selectTouchText}>{String(displayVal)}</Text>
                  </TouchableOpacity>
                </View>
              );
            }

            if (attr.type === 'number') {
              return (
                <View key={attr.key} style={styles.section}>
                  <TextInputField
                    label={label}
                    placeholder={attr.unit ? `0 ${attr.unit}` : '0'}
                    value={value != null ? String(value) : ''}
                    onChangeText={(t) =>
                      setAttrFilter(attr.key, t === '' ? '' : (Number(t) as number))
                    }
                    keyboardType="numeric"
                  />
                </View>
              );
            }

            if (attr.type === 'boolean') {
              const boolVal = value === true || value === 'true';
              return (
                <View key={attr.key} style={styles.switchRow}>
                  <Text style={styles.sectionLabel}>{label}</Text>
                  <Switch
                    value={boolVal}
                    onValueChange={(v) => setAttrFilter(attr.key, v)}
                    trackColor={{ true: colors.primary }}
                  />
                </View>
              );
            }

            return null;
          })}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sort by</Text>
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key ?? 'newest'}
                style={[
                  styles.sortOption,
                  tempFilters.sort_by === opt.key && styles.sortOptionActive,
                ]}
                onPress={() => onTempFiltersChange({ ...tempFilters, sort_by: opt.key })}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    tempFilters.sort_by === opt.key && styles.sortOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.clearButton} onPress={onClear}>
              <Text style={styles.clearButtonText}>{clearLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onApply}>
              <Text style={styles.applyButtonText}>{applyLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      <Modal
        visible={selectModalKey != null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectModalKey(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectModalKey(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {activeAttr ? getLabel(activeAttr, locale) : ''}
            </Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                if (selectModalKey) setAttrFilter(selectModalKey, '');
                setSelectModalKey(null);
              }}
            >
              <Text style={styles.modalOptionText}>Any</Text>
            </TouchableOpacity>
            <FlatList
              data={activeOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    if (selectModalKey) setAttrFilter(selectModalKey, item.value);
                    setSelectModalKey(null);
                  }}
                >
                  <Text style={styles.modalOptionText}>
                    {item.label_en ?? item.label_vi ?? item.value}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCancel} onPress={() => setSelectModalKey(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  closeText: {
    ...typography.label,
    color: colors.primary,
  },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
  },
  dash: {
    ...typography.body,
    color: colors.textTertiary,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  conditionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  conditionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  conditionText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  conditionTextActive: {
    color: colors.textInverse,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  selectTouch: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  selectTouchText: {
    ...typography.body,
    color: colors.text,
  },
  sortOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  sortOptionActive: {
    backgroundColor: colors.surfaceSecondary,
  },
  sortOptionText: {
    ...typography.body,
    color: colors.text,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  clearButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  clearButtonText: {
    ...typography.label,
    color: colors.text,
  },
  applyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    ...typography.label,
    color: colors.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: 400,
  },
  modalTitle: {
    ...typography.title3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    ...typography.body,
    color: colors.text,
  },
  modalCancel: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.label,
    color: colors.primary,
  },
  radiusRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  radiusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  radiusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radiusChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  radiusChipTextActive: {
    color: colors.textInverse,
  },
  radiusHint: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
