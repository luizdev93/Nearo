/**
 * Dynamic Category Engine types (schema-driven categories and attributes).
 * Aligns with DB: categories, attributes, attribute_options, listing_attribute_values.
 */

export type AttributeType =
  | 'select'
  | 'multiselect'
  | 'number'
  | 'number_range'
  | 'boolean'
  | 'text'
  | 'location';

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface Attribute {
  id: string;
  category_id: string;
  key: string;
  type: AttributeType;
  label_en: string | null;
  label_vi: string | null;
  required: boolean;
  filterable: boolean;
  sortable: boolean;
  unit: string | null;
  depends_on: string | null;
  options_source: string | null;
  sort_order: number;
  created_at: string;
}

export interface AttributeOption {
  id: string;
  attribute_id: string;
  parent_value: string | null;
  value: string;
  label_en: string | null;
  label_vi: string | null;
  created_at: string;
}

export interface CategoryTemplateAttribute {
  id: string;
  key: string;
  type: AttributeType;
  label_en: string | null;
  label_vi: string | null;
  required: boolean;
  filterable: boolean;
  sortable: boolean;
  unit: string | null;
  depends_on: string | null;
  sort_order: number;
  options: Array<{
    value: string;
    label_en: string | null;
    label_vi: string | null;
    parent_value: string | null;
  }>;
}

export interface CategoryTemplate {
  category_id: string;
  category_name: string;
  category_slug: string;
  attributes: CategoryTemplateAttribute[];
}

export interface ListingAttributeValue {
  id: string;
  listing_id: string;
  attribute_id: string;
  value: string;
  created_at: string;
}
