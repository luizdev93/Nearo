import { UserPreview } from './user';

export type ListingCondition = 'new' | 'used';
export type ListingStatus = 'active' | 'sold' | 'removed';

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  position: number;
  created_at: string;
}

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  category_id: string | null;
  condition: ListingCondition;
  negotiable: boolean;
  location_lat: number | null;
  location_lng: number | null;
  location_name: string | null;
  is_featured: boolean;
  featured_until: string | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface ListingWithImages extends Listing {
  images: ListingImage[];
}

export interface ListingWithOwner extends ListingWithImages {
  owner: UserPreview;
}

export interface ListingCard {
  id: string;
  title: string;
  price: number;
  location_name: string | null;
  is_featured: boolean;
  image_url: string | null;
  created_at: string;
  /** Distance in km from user (when location filter used). */
  distance_km?: number | null;
}

/** Attribute values for dynamic category attributes (key = attribute key, value = string). */
export type CreateListingAttributeValues = Record<string, string | number | boolean>;

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  /** Slug for backward compat; prefer category_id when using dynamic engine. */
  category: string;
  /** Leaf category id (dynamic engine). When set, category slug is derived from template. */
  category_id?: string;
  condition: ListingCondition;
  negotiable: boolean;
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  /** Dynamic attribute values keyed by attribute key (e.g. brand, model). */
  attribute_values?: CreateListingAttributeValues;
}

/** Attribute filter values: key = attribute key, value = string or { min?, max? } for ranges. */
export type AttributeFilterValues = Record<
  string,
  string | number | boolean | { min?: number; max?: number }
>;

export interface ListingFilters {
  category?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  condition?: ListingCondition;
  negotiable?: boolean;
  location_lat?: number;
  location_lng?: number;
  radius_km?: number;
  sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'nearest' | 'farthest';
  attribute_filters?: AttributeFilterValues;
}
