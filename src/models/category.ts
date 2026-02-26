/**
 * @deprecated Use categoryService.getLeafCategories() and category_engine types instead.
 * Kept for backward compatibility; new code should use the Dynamic Category Engine.
 */
export const CATEGORIES = [
  'vehicles',
  'real_estate',
  'jobs',
  'electronics',
  'home_furniture',
  'fashion',
  'services',
  'others',
] as const;

/** @deprecated Use Category from category_engine for API-driven categories. */
export type Category = (typeof CATEGORIES)[number];

/** @deprecated Icons are now on category rows from API (categories.icon). */
export const CATEGORY_ICONS: Record<Category, string> = {
  vehicles: 'car',
  real_estate: 'home',
  jobs: 'briefcase',
  electronics: 'laptop',
  home_furniture: 'bed',
  fashion: 'shirt',
  services: 'construct',
  others: 'ellipsis-horizontal',
};
