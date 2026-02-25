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

export type Category = (typeof CATEGORIES)[number];

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
