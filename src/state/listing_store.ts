import { create } from 'zustand';
import { ListingCard, ListingWithOwner, CreateListingInput, ListingFilters, Listing } from '../models/listing';
import { listingService } from '../services/listing_service';

interface ListingState {
  featuredListings: ListingCard[];
  feedListings: ListingCard[];
  searchResults: ListingCard[];
  currentListing: ListingWithOwner | null;
  userListings: ListingCard[];

  feedCursor: string | null;
  feedHasMore: boolean;
  searchCursor: string | null;
  searchHasMore: boolean;

  isLoading: boolean;
  isLoadingMore: boolean;
  isCreating: boolean;
  error: string | null;

  loadFeatured: () => Promise<void>;
  loadFeed: () => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  loadListing: (id: string) => Promise<void>;
  search: (query: string, filters: ListingFilters) => Promise<void>;
  searchMore: (query: string, filters: ListingFilters) => Promise<void>;
  loadUserListings: (userId: string, status?: string) => Promise<void>;
  createListing: (input: CreateListingInput, imageUris: string[], ownerId: string) => Promise<Listing | null>;
  promoteListing: (id: string) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  clearSearch: () => void;
  clearError: () => void;
}

export const useListingStore = create<ListingState>((set, get) => ({
  featuredListings: [],
  feedListings: [],
  searchResults: [],
  currentListing: null,
  userListings: [],

  feedCursor: null,
  feedHasMore: true,
  searchCursor: null,
  searchHasMore: true,

  isLoading: false,
  isLoadingMore: false,
  isCreating: false,
  error: null,

  loadFeatured: async () => {
    const { data } = await listingService.getFeaturedListings();
    if (data) set({ featuredListings: data });
  },

  loadFeed: async () => {
    set({ isLoading: true, error: null });
    const { data, error } = await listingService.getRecentListings(null);
    if (error) {
      set({ isLoading: false, error });
    } else if (data) {
      set({
        feedListings: data.items,
        feedCursor: data.cursor,
        feedHasMore: data.hasMore,
        isLoading: false,
      });
    }
  },

  loadMoreFeed: async () => {
    const { feedCursor, feedHasMore, isLoadingMore } = get();
    if (!feedHasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    const { data } = await listingService.getRecentListings(feedCursor);
    if (data) {
      set((state) => ({
        feedListings: [...state.feedListings, ...data.items],
        feedCursor: data.cursor,
        feedHasMore: data.hasMore,
        isLoadingMore: false,
      }));
    } else {
      set({ isLoadingMore: false });
    }
  },

  loadListing: async (id: string) => {
    set({ isLoading: true, error: null, currentListing: null });
    const { data, error } = await listingService.getListingById(id);
    if (error) {
      set({ isLoading: false, error });
    } else {
      set({ currentListing: data, isLoading: false });
    }
  },

  search: async (query: string, filters: ListingFilters) => {
    set({ isLoading: true, error: null });
    const { data, error } = await listingService.searchListings(query, filters, null);
    if (error) {
      set({ isLoading: false, error });
    } else if (data) {
      set({
        searchResults: data.items,
        searchCursor: data.cursor,
        searchHasMore: data.hasMore,
        isLoading: false,
      });
    }
  },

  searchMore: async (query: string, filters: ListingFilters) => {
    const { searchCursor, searchHasMore, isLoadingMore } = get();
    if (!searchHasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    const { data } = await listingService.searchListings(query, filters, searchCursor);
    if (data) {
      set((state) => ({
        searchResults: [...state.searchResults, ...data.items],
        searchCursor: data.cursor,
        searchHasMore: data.hasMore,
        isLoadingMore: false,
      }));
    } else {
      set({ isLoadingMore: false });
    }
  },

  loadUserListings: async (userId: string, status?: string) => {
    set({ isLoading: true, error: null });
    const { data, error } = await listingService.getUserListings(userId, status);
    if (error) {
      set({ isLoading: false, error });
    } else {
      set({ userListings: data ?? [], isLoading: false });
    }
  },

  createListing: async (input, imageUris, ownerId) => {
    set({ isCreating: true, error: null });
    const { data, error } = await listingService.createListing(input, imageUris, ownerId);
    if (error) {
      set({ isCreating: false, error });
      return null;
    }
    set({ isCreating: false });
    return data;
  },

  promoteListing: async (id: string) => {
    const { error } = await listingService.promoteListing(id);
    return !error;
  },

  deleteListing: async (id: string) => {
    const { error } = await listingService.deleteListing(id);
    if (!error) {
      set((state) => ({
        feedListings: state.feedListings.filter((l) => l.id !== id),
        userListings: state.userListings.filter((l) => l.id !== id),
      }));
    }
    return !error;
  },

  clearSearch: () => set({ searchResults: [], searchCursor: null, searchHasMore: true }),

  clearError: () => set({ error: null }),
}));
