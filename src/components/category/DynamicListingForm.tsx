import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Switch,
} from 'react-native';
import { TextInputField } from '../form/TextInputField';
import { colors, spacing, borderRadius, typography } from '../../theme';
import type {
  CategoryTemplate,
  CategoryTemplateAttribute,
} from '../../models/category_engine';
import type { CreateListingAttributeValues } from '../../models/listing';
import type { ListingCondition } from '../../models/listing';

function getLabel(attr: CategoryTemplateAttribute, locale: 'en' | 'vi' = 'en'): string {
  const label = locale === 'vi' ? attr.label_vi : attr.label_en;
  return label ?? attr.key;
}

interface DynamicListingFormProps {
  template: CategoryTemplate | null;
  title: string;
  description: string;
  price: string;
  condition: ListingCondition;
  negotiable: boolean;
  attributeValues: CreateListingAttributeValues;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onConditionChange: (v: ListingCondition) => void;
  onNegotiableChange: (v: boolean) => void;
  onAttributeChange: (key: string, value: string | number | boolean) => void;
  errors?: Record<string, string>;
  /** Optional: locale for attribute labels */
  locale?: 'en' | 'vi';
}

export function DynamicListingForm({
  template,
  title,
  description,
  price,
  condition,
  negotiable,
  attributeValues,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onConditionChange,
  onNegotiableChange,
  onAttributeChange,
  errors = {},
  locale = 'en',
}: DynamicListingFormProps) {
  const [selectModalKey, setSelectModalKey] = useState<string | null>(null);

  const activeAttr = template?.attributes.find((a) => a.key === selectModalKey);
  const activeOptions = activeAttr
    ? activeAttr.depends_on
      ? attributeValues[activeAttr.depends_on] != null
        ? activeAttr.options.filter(
            (o) =>
              String(o.parent_value ?? '') === String(attributeValues[activeAttr.depends_on!]),
          )
        : []
      : activeAttr.options
    : [];

  const canShowDependent = (attr: CategoryTemplateAttribute): boolean => {
    if (!attr.depends_on) return true;
    const parentVal = attributeValues[attr.depends_on];
    return parentVal !== undefined && parentVal !== null && parentVal !== '';
  };

  return (
    <>
      <TextInputField
        label="Title"
        placeholder="Listing title"
        value={title}
        onChangeText={onTitleChange}
        error={errors.title}
      />
      <TextInputField
        label="Description"
        placeholder="Description"
        value={description}
        onChangeText={onDescriptionChange}
        multiline
        numberOfLines={4}
        inputStyle={styles.textArea}
        error={errors.description}
      />
      <TextInputField
        label="Price"
        placeholder="0"
        value={price}
        onChangeText={onPriceChange}
        keyboardType="numeric"
        error={errors.price}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Condition</Text>
        <View style={styles.conditionRow}>
          <TouchableOpacity
            style={[styles.conditionBtn, condition === 'new' && styles.conditionActive]}
            onPress={() => onConditionChange('new')}
          >
            <Text style={[styles.conditionText, condition === 'new' && styles.conditionTextActive]}>
              New
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.conditionBtn, condition === 'used' && styles.conditionActive]}
            onPress={() => onConditionChange('used')}
          >
            <Text style={[styles.conditionText, condition === 'used' && styles.conditionTextActive]}>
              Used
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.sectionLabel}>Negotiable</Text>
        <Switch
          value={negotiable}
          onValueChange={onNegotiableChange}
          trackColor={{ true: colors.primary }}
        />
      </View>

      {template?.attributes.map((attr) => {
        const visible = canShowDependent(attr);
        const label = getLabel(attr, locale);
        const value = attributeValues[attr.key];

        if (!visible) return null;

        if (attr.type === 'select') {
          const displayVal =
            attr.options.find((o) => o.value === value)?.label_en ?? value ?? 'Select...';
          return (
            <View key={attr.key} style={styles.section}>
              <Text style={styles.sectionLabel}>{label}</Text>
              <TouchableOpacity
                style={styles.selectTouch}
                onPress={() => setSelectModalKey(attr.key)}
              >
                <Text style={styles.selectTouchText}>{String(displayVal)}</Text>
              </TouchableOpacity>
              {errors[attr.key] ? (
                <Text style={styles.errorText}>{errors[attr.key]}</Text>
              ) : null}
            </View>
          );
        }

        if (attr.type === 'number' || attr.type === 'number_range') {
          const isRange = attr.type === 'number_range';
          if (isRange) {
            const minVal = attributeValues[`${attr.key}_min`] ?? '';
            const maxVal = attributeValues[`${attr.key}_max`] ?? '';
            return (
              <View key={attr.key} style={styles.section}>
                <Text style={styles.sectionLabel}>{label}</Text>
                <View style={styles.rangeRow}>
                  <TextInputField
                    placeholder="Min"
                    value={String(minVal)}
                    onChangeText={(t) => onAttributeChange(`${attr.key}_min`, t)}
                    keyboardType="numeric"
                    inputStyle={styles.rangeInput}
                  />
                  <Text style={styles.rangeSep}>–</Text>
                  <TextInputField
                    placeholder="Max"
                    value={String(maxVal)}
                    onChangeText={(t) => onAttributeChange(`${attr.key}_max`, t)}
                    keyboardType="numeric"
                    inputStyle={styles.rangeInput}
                  />
                </View>
              </View>
            );
          }
          return (
            <View key={attr.key} style={styles.section}>
              <TextInputField
                label={label}
                placeholder={attr.unit ? `0 ${attr.unit}` : '0'}
                value={value != null ? String(value) : ''}
                onChangeText={(t) => onAttributeChange(attr.key, t === '' ? '' : Number(t))}
                keyboardType="numeric"
                error={errors[attr.key]}
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
                onValueChange={(v) => onAttributeChange(attr.key, v)}
                trackColor={{ true: colors.primary }}
              />
            </View>
          );
        }

        if (attr.type === 'text') {
          return (
            <View key={attr.key} style={styles.section}>
              <TextInputField
                label={label}
                placeholder={label}
                value={value != null ? String(value) : ''}
                onChangeText={(t) => onAttributeChange(attr.key, t)}
                error={errors[attr.key]}
              />
            </View>
          );
        }

        return null;
      })}

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
            <FlatList
              data={activeOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    onAttributeChange(selectModalKey!, item.value);
                    setSelectModalKey(null);
                  }}
                >
                  <Text style={styles.modalOptionText}>
                    {item.label_en ?? item.label_vi ?? item.value}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setSelectModalKey(null)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
    marginBottom: spacing.sm,
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
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rangeInput: {
    flex: 1,
  },
  rangeSep: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
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
});
