import { create } from 'zustand';
import { User } from '../models/user';
import { userService } from '../services/user_service';
import { favoriteService } from '../services/favorite_service';
import { ListingCard } from '../models/listing';

interface UserState {
  profile: User | null;
  favorites: ListingCard[];
  favoritedIds: Set<string>;
  isLoading: boolean;
  error: string | null;

  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatar_url?: string; language?: string }) => Promise<boolean>;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (listingId: string) => Promise<void>;
  isFavorited: (listingId: string) => boolean;
  setProfile: (profile: User) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  favorites: [],
  favoritedIds: new Set(),
  isLoading: false,
  error: null,

  loadProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    const { data, error } = await userService.getUser(userId);
    if (error) set({ error, isLoading: false });
    else set({ profile: data, isLoading: false });
  },

  updateProfile: async (data) => {
    const { profile } = get();
    if (!profile) return false;

    set({ isLoading: true, error: null });
    const { data: updated, error } = await userService.updateUser(profile.id, data);
    if (error || !updated) {
      set({ isLoading: false, error: error ?? 'Update failed' });
      return false;
    }
    set({ profile: updated, isLoading: false });
    return true;
  },

  loadFavorites: async () => {
    const { profile } = get();
    if (!profile) return;

    set({ isLoading: true });
    const { data, error } = await favoriteService.getFavorites(profile.id);
    if (!error && data) {
      set({
        favorites: data,
        favoritedIds: new Set(data.map((l) => l.id)),
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (listingId: string) => {
    const { profile, favoritedIds, favorites } = get();
    if (!profile) return;

    const isFav = favoritedIds.has(listingId);

    if (isFav) {
      const newIds = new Set(favoritedIds);
      newIds.delete(listingId);
      set({
        favoritedIds: newIds,
        favorites: favorites.filter((l) => l.id !== listingId),
      });
      await favoriteService.removeFavorite(profile.id, listingId);
    } else {
      const newIds = new Set(favoritedIds);
      newIds.add(listingId);
      set({ favoritedIds: newIds });
      await favoriteService.addFavorite(profile.id, listingId);
    }
  },

  isFavorited: (listingId: string) => {
    return get().favoritedIds.has(listingId);
  },

  setProfile: (profile: User) => set({ profile }),
}));
