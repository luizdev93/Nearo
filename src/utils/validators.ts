import { LISTING_IMAGE_MAX_COUNT, RATING_MAX, RATING_MIN } from './constants';

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  return /^\+?[1-9]\d{6,14}$/.test(cleaned);
}

export function isValidOTP(code: string): boolean {
  return /^\d{6}$/.test(code);
}

export function isValidPrice(price: number): boolean {
  return price > 0 && Number.isFinite(price);
}

export function isValidRating(value: number): boolean {
  return Number.isInteger(value) && value >= RATING_MIN && value <= RATING_MAX;
}

export function isValidListingTitle(title: string): boolean {
  return title.trim().length >= 3 && title.trim().length <= 100;
}

export function isValidListingDescription(description: string): boolean {
  return description.trim().length >= 10 && description.trim().length <= 2000;
}

export function isValidImageCount(count: number): boolean {
  return count >= 1 && count <= LISTING_IMAGE_MAX_COUNT;
}
