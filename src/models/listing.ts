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
}

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: ListingCondition;
  negotiable: boolean;
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
}

export interface ListingFilters {
  category?: string;
  min_price?: number;
  max_price?: number;
  condition?: ListingCondition;
  negotiable?: boolean;
  location_lat?: number;
  location_lng?: number;
  radius_km?: number;
  sort_by?: 'newest' | 'price_asc' | 'price_desc';
}
