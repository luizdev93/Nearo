import * as ImagePicker from 'expo-image-picker';
import { LISTING_IMAGE_MAX_WIDTH, LISTING_IMAGE_QUALITY } from './constants';

export async function pickImages(
  maxCount: number = 10,
): Promise<ImagePicker.ImagePickerAsset[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: maxCount,
    quality: LISTING_IMAGE_QUALITY,
    exif: false,
  });

  if (result.canceled) return [];
  return result.assets;
}

export async function takePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    quality: LISTING_IMAGE_QUALITY,
    exif: false,
  });

  if (result.canceled) return null;
  return result.assets[0] ?? null;
}

export function getImageFileName(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1] ?? `image_${Date.now()}.jpg`;
}

export function getImageMimeType(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}
