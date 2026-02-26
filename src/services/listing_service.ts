import { supabase } from './api/supabase_client';
import { ServiceResponse } from './auth_service';
import {
  Listing,
  ListingCard,
  ListingWithOwner,
  CreateListingInput,
  ListingFilters,
  ListingImage,
} from '../models/listing';
import { storageService } from './storage_service';
import { FEED_PAGE_SIZE, FEATURED_LIMIT, PROMOTION_DURATION_HOURS } from '../utils/constants';
import { getBoundingBox, haversineDistanceKm } from '../utils/location';

interface PaginatedResponse<T> {
  items: T[];
  cursor: string | null;
  hasMore: boolean;
}

export const listingService = {
  async getFeaturedListings(): Promise<ServiceResponse<ListingCard[]>> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id, title, price, location_name, is_featured, created_at,
          listing_images!inner(url)
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .gt('featured_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(FEATURED_LIMIT);

      if (error) return { data: null, error: error.message };

      const cards: ListingCard[] = (data ?? []).map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        location_name: item.location_name,
        is_featured: item.is_featured,
        image_url: item.listing_images?.[0]?.url ?? null,
        created_at: item.created_at,
      }));

      return { data: cards, error: null };
    } catch {
      return { data: null, error: 'Failed to load featured listings' };
    }
  },

  async getRecentListings(
    cursor: string | null,
  ): Promise<ServiceResponse<PaginatedResponse<ListingCard>>> {
    try {
      let query = supabase
        .from('listings')
        .select(`
          id, title, price, location_name, is_featured, created_at,
          listing_images(url, position)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(FEED_PAGE_SIZE);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;
      if (error) return { data: null, error: error.message };

      const items: ListingCard[] = (data ?? []).map((item: any) => {
        const sortedImages = (item.listing_images ?? []).sort(
          (a: any, b: any) => a.position - b.position,
        );
        return {
          id: item.id,
          title: item.title,
          price: item.price,
          location_name: item.location_name,
          is_featured: item.is_featured,
          image_url: sortedImages[0]?.url ?? null,
          created_at: item.created_at,
        };
      });

      const lastItem = items[items.length - 1];
      return {
        data: {
          items,
          cursor: lastItem?.created_at ?? null,
          hasMore: items.length === FEED_PAGE_SIZE,
        },
        error: null,
      };
    } catch {
      return { data: null, error: 'Failed to load listings' };
    }
  },

  async getNearbyListings(
    lat: number,
    lng: number,
    radiusKm: number,
    cursor: string | null,
  ): Promise<ServiceResponse<PaginatedResponse<ListingCard>>> {
    try {
      const box = getBoundingBox(lat, lng, radiusKm);

      let query = supabase
        .from('listings')
        .select(`
          id, title, price, location_name, is_featured, created_at,
          listing_images(url, position)
        `)
        .eq('status', 'active')
        .gte('location_lat', box.minLat)
        .lte('location_lat', box.maxLat)
        .gte('location_lng', box.minLng)
        .lte('location_lng', box.maxLng)
        .order('created_at', { ascending: false })
        .limit(FEED_PAGE_SIZE);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;
      if (error) return { data: null, error: error.message };

      const items: ListingCard[] = (data ?? []).map((item: any) => {
        const sortedImages = (item.listing_images ?? []).sort(
          (a: any, b: any) => a.position - b.position,
        );
        return {
          id: item.id,
          title: item.title,
          price: item.price,
          location_name: item.location_name,
          is_featured: item.is_featured,
          image_url: sortedImages[0]?.url ?? null,
          created_at: item.created_at,
        };
      });

      const lastItem = items[items.length - 1];
      return {
        data: {
          items,
          cursor: lastItem?.created_at ?? null,
          hasMore: items.length === FEED_PAGE_SIZE,
        },
        error: null,
      };
    } catch {
      return { data: null, error: 'Failed to load nearby listings' };
    }
  },

  async getListingById(id: string): Promise<ServiceResponse<ListingWithOwner>> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images(id, url, position),
          users!owner_id(id, name, avatar_url, rating_average, rating_count, created_at)
        `)
        .eq('id', id)
        .single();

      if (error) return { data: null, error: error.message };

      const listing = data as any;
      const images = (listing.listing_images ?? []).sort(
        (a: any, b: any) => a.position - b.position,
      );

      return {
        data: {
          ...listing,
          images,
          owner: listing.users,
          listing_images: undefined,
          users: undefined,
        } as ListingWithOwner,
        error: null,
      };
    } catch {
      return { data: null, error: 'Failed to load listing' };
    }
  },

  async searchListings(
    query: string,
    filters: ListingFilters,
    cursor: string | null,
  ): Promise<ServiceResponse<PaginatedResponse<ListingCard>>> {
    try {
      let listingIdsFromAttributes: string[] | null = null;
      if (
        filters.category_id &&
        filters.attribute_filters &&
        Object.keys(filters.attribute_filters).length > 0
      ) {
        const { data: attrs } = await supabase
          .from('attributes')
          .select('id, key')
          .eq('category_id', filters.category_id);
        const keyToId = new Map((attrs ?? []).map((a: { id: string; key: string }) => [a.key, a.id]));
        const conditions: Array<{ attribute_id: string; value: string }> = [];
        for (const [key, val] of Object.entries(filters.attribute_filters)) {
          const attrId = keyToId.get(key);
          if (attrId == null) continue;
          if (val === undefined || val === null || val === '') continue;
          if (typeof val === 'object' && ('min' in val || 'max' in val)) {
            let rangeQuery = supabase
              .from('listing_attribute_values')
              .select('listing_id')
              .eq('attribute_id', attrId);
            if (val.min != null && val.min !== '') {
              rangeQuery = rangeQuery.gte('value', String(val.min));
            }
            if (val.max != null && val.max !== '') {
              rangeQuery = rangeQuery.lte('value', String(val.max));
            }
            const { data: rangeRows } = await rangeQuery;
            const ids = (rangeRows ?? []).map((r: { listing_id: string }) => r.listing_id);
            if (ids.length === 0) {
              listingIdsFromAttributes = [];
              break;
            }
            listingIdsFromAttributes =
              listingIdsFromAttributes == null
                ? ids
                : listingIdsFromAttributes.filter((id) => ids.includes(id));
            continue;
          }
          const valueStr = typeof val === 'object' ? '' : String(val);
          if (valueStr === '') continue;
          const { data: rows } = await supabase
            .from('listing_attribute_values')
            .select('listing_id')
            .eq('attribute_id', attrId)
            .eq('value', valueStr);
          const ids = (rows ?? []).map((r: { listing_id: string }) => r.listing_id);
          if (ids.length === 0) {
            listingIdsFromAttributes = [];
            break;
          }
          listingIdsFromAttributes =
            listingIdsFromAttributes == null
              ? ids
              : listingIdsFromAttributes.filter((id) => ids.includes(id));
        }
        if (listingIdsFromAttributes !== null && listingIdsFromAttributes.length === 0) {
          return {
            data: { items: [], cursor: null, hasMore: false },
            error: null,
          };
        }
      }

      const userLat = filters.location_lat;
      const userLng = filters.location_lng;
      const needDistance =
        (userLat != null && userLng != null) &&
        (filters.sort_by === 'nearest' || filters.sort_by === 'farthest');

      let dbQuery = supabase
        .from('listings')
        .select(
          needDistance
            ? `
          id, title, price, location_name, location_lat, location_lng, is_featured, created_at,
          listing_images(url, position)
        `
            : `
          id, title, price, location_name, is_featured, created_at,
          listing_images(url, position)
        `,
        )
        .eq('status', 'active');

      if (listingIdsFromAttributes && listingIdsFromAttributes.length > 0) {
        dbQuery = dbQuery.in('id', listingIdsFromAttributes);
      }
      if (query.trim()) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }
      if (filters.category_id) {
        dbQuery = dbQuery.eq('category_id', filters.category_id);
      } else if (filters.category) {
        dbQuery = dbQuery.eq('category', filters.category);
      }
      if (filters.min_price !== undefined) {
        dbQuery = dbQuery.gte('price', filters.min_price);
      }
      if (filters.max_price !== undefined) {
        dbQuery = dbQuery.lte('price', filters.max_price);
      }
      if (filters.condition) {
        dbQuery = dbQuery.eq('condition', filters.condition);
      }
      if (filters.negotiable) {
        dbQuery = dbQuery.eq('negotiable', true);
      }
      if (filters.location_lat && filters.location_lng && filters.radius_km) {
        const box = getBoundingBox(
          filters.location_lat,
          filters.location_lng,
          filters.radius_km,
        );
        dbQuery = dbQuery
          .gte('location_lat', box.minLat)
          .lte('location_lat', box.maxLat)
          .gte('location_lng', box.minLng)
          .lte('location_lng', box.maxLng);
      }

      if (filters.sort_by === 'price_asc') {
        dbQuery = dbQuery.order('price', { ascending: true });
      } else if (filters.sort_by === 'price_desc') {
        dbQuery = dbQuery.order('price', { ascending: false });
      } else {
        dbQuery = dbQuery.order('created_at', { ascending: false });
      }

      if (cursor) {
        dbQuery = dbQuery.lt('created_at', cursor);
      }

      dbQuery = dbQuery.limit(FEED_PAGE_SIZE);

      const { data, error } = await dbQuery;
      if (error) return { data: null, error: error.message };

      let items: ListingCard[] = (data ?? []).map((item: any) => {
        const sortedImages = (item.listing_images ?? []).sort(
          (a: any, b: any) => a.position - b.position,
        );
        const card: ListingCard = {
          id: item.id,
          title: item.title,
          price: item.price,
          location_name: item.location_name,
          is_featured: item.is_featured,
          image_url: sortedImages[0]?.url ?? null,
          created_at: item.created_at,
        };
        if (
          userLat != null &&
          userLng != null &&
          item.location_lat != null &&
          item.location_lng != null
        ) {
          card.distance_km = haversineDistanceKm(
            userLat,
            userLng,
            item.location_lat,
            item.location_lng,
          );
        }
        return card;
      });

      if (
        (filters.sort_by === 'nearest' || filters.sort_by === 'farthest') &&
        userLat != null &&
        userLng != null
      ) {
        items = [...items].sort((a, b) => {
          const da = a.distance_km ?? Infinity;
          const db = b.distance_km ?? Infinity;
          return filters.sort_by === 'nearest' ? da - db : db - da;
        });
      }

      const lastItem = items[items.length - 1];
      return {
        data: {
          items,
          cursor: lastItem?.created_at ?? null,
          hasMore: items.length === FEED_PAGE_SIZE,
        },
        error: null,
      };
    } catch {
      return { data: null, error: 'Failed to search listings' };
    }
  },

  async getListingsByCategory(
    category: string,
    cursor: string | null,
  ): Promise<ServiceResponse<PaginatedResponse<ListingCard>>> {
    return this.searchListings('', { category }, cursor);
  },

  async getUserListings(
    userId: string,
    status?: string,
  ): Promise<ServiceResponse<ListingCard[]>> {
    try {
      let query = supabase
        .from('listings')
        .select(`
          id, title, price, location_name, is_featured, created_at, status,
          listing_images(url, position)
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) return { data: null, error: error.message };

      const items: ListingCard[] = (data ?? []).map((item: any) => {
        const sortedImages = (item.listing_images ?? []).sort(
          (a: any, b: any) => a.position - b.position,
        );
        return {
          id: item.id,
          title: item.title,
          price: item.price,
          location_name: item.location_name,
          is_featured: item.is_featured,
          image_url: sortedImages[0]?.url ?? null,
          created_at: item.created_at,
        };
      });

      return { data: items, error: null };
    } catch {
      return { data: null, error: 'Failed to load user listings' };
    }
  },

  async createListing(
    input: CreateListingInput,
    imageUris: string[],
    ownerId: string,
  ): Promise<ServiceResponse<Listing>> {
    try {
      const payload: Record<string, unknown> = {
        title: input.title,
        description: input.description,
        price: input.price,
        category: input.category,
        condition: input.condition,
        negotiable: input.negotiable,
        owner_id: ownerId,
        status: 'active',
        location_lat: input.location_lat ?? null,
        location_lng: input.location_lng ?? null,
        location_name: input.location_name ?? null,
      };
      if (input.category_id) payload.category_id = input.category_id;

      const { data: listing, error } = await supabase
        .from('listings')
        .insert(payload)
        .select('*')
        .single();

      if (error) return { data: null, error: error.message };

      if (listing && input.attribute_values && Object.keys(input.attribute_values).length > 0 && input.category_id) {
        const { data: attrs } = await supabase
          .from('attributes')
          .select('id, key')
          .eq('category_id', input.category_id);
        const keyToId = new Map((attrs ?? []).map((a: { id: string; key: string }) => [a.key, a.id]));
        const rows = Object.entries(input.attribute_values)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([key, value]) => ({
            listing_id: listing.id,
            attribute_id: keyToId.get(key),
            value: String(value),
          }))
          .filter((r) => r.attribute_id);
        if (rows.length > 0) {
          await supabase.from('listing_attribute_values').insert(rows);
        }
      }

      const uploadPromises = imageUris.map(async (uri, index) => {
        const { data: url } = await storageService.uploadListingImage(uri, listing.id);
        if (url) {
          await supabase.from('listing_images').insert({
            listing_id: listing.id,
            url,
            position: index,
          });
        }
      });

      await Promise.all(uploadPromises);

      return { data: listing as Listing, error: null };
    } catch {
      return { data: null, error: 'Failed to create listing' };
    }
  },

  async updateListing(
    id: string,
    updates: Partial<Listing>,
  ): Promise<ServiceResponse<Listing>> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as Listing, error: null };
    } catch {
      return { data: null, error: 'Failed to update listing' };
    }
  },

  async deleteListing(id: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'removed' })
        .eq('id', id);
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch {
      return { data: null, error: 'Failed to delete listing' };
    }
  },

  async promoteListing(id: string): Promise<ServiceResponse<Listing>> {
    try {
      const featuredUntil = new Date();
      featuredUntil.setHours(featuredUntil.getHours() + PROMOTION_DURATION_HOURS);

      const { data, error } = await supabase
        .from('listings')
        .update({
          is_featured: true,
          featured_until: featuredUntil.toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Listing, error: null };
    } catch {
      return { data: null, error: 'Failed to promote listing' };
    }
  },
};
