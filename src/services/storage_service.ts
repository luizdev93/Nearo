import { supabase } from './api/supabase_client';
import { ServiceResponse } from './auth_service';
import { STORAGE_BUCKETS } from '../utils/constants';
import { getImageFileName, getImageMimeType } from '../utils/image';

export const storageService = {
  async uploadListingImage(
    uri: string,
    listingId: string,
  ): Promise<ServiceResponse<string>> {
    return this._uploadImage(uri, STORAGE_BUCKETS.LISTING_IMAGES, `listings/${listingId}`);
  },

  async uploadProfileImage(
    uri: string,
    userId: string,
  ): Promise<ServiceResponse<string>> {
    return this._uploadImage(uri, STORAGE_BUCKETS.PROFILE_IMAGES, `profiles/${userId}`);
  },

  async uploadChatImage(
    uri: string,
    chatId: string,
  ): Promise<ServiceResponse<string>> {
    return this._uploadImage(uri, STORAGE_BUCKETS.LISTING_IMAGES, `chats/${chatId}`);
  },

  async _uploadImage(
    uri: string,
    bucket: string,
    folder: string,
  ): Promise<ServiceResponse<string>> {
    try {
      const fileName = getImageFileName(uri);
      const filePath = `${folder}/${Date.now()}_${fileName}`;
      const mimeType = getImageMimeType(uri);

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) return { data: null, error: error.message };

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { data: urlData.publicUrl, error: null };
    } catch {
      return { data: null, error: 'Failed to upload image' };
    }
  },
};
