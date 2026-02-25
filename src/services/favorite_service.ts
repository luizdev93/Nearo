import { supabase } from './api/supabase_client';
import { ServiceResponse } from './auth_service';
import { ListingCard } from '../models/listing';

export const favoriteService = {
  async getFavorites(userId: string): Promise<ServiceResponse<ListingCard[]>> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          listing_id,
          listings!listing_id(
            id, title, price, location_name, is_featured, created_at,
            listing_images(url, position)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return { data: null, error: error.message };

      const items: ListingCard[] = (data ?? []).map((fav: any) => {
        const listing = fav.listings;
        const sortedImages = (listing?.listing_images ?? []).sort(
          (a: any, b: any) => a.position - b.position,
        );
        return {
          id: listing.id,
          title: listing.title,
          price: listing.price,
          location_name: listing.location_name,
          is_featured: listing.is_featured,
          image_url: sortedImages[0]?.url ?? null,
          created_at: listing.created_at,
        };
      });

      return { data: items, error: null };
    } catch {
      return { data: null, error: 'Failed to load favorites' };
    }
  },

  async addFavorite(
    userId: string,
    listingId: string,
  ): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, listing_id: listingId });
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch {
      return { data: null, error: 'Failed to add favorite' };
    }
  },

  async removeFavorite(
    userId: string,
    listingId: string,
  ): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch {
      return { data: null, error: 'Failed to remove favorite' };
    }
  },
};
