/**
 * Keyword → category slug mapping for smart search suggestions.
 * Used to show "Search [query] in [Category]" suggestions.
 */

const KEYWORD_TO_CATEGORY: Record<string, string> = {
  // Electronics
  iphone: 'electronics',
  smartphone: 'electronics',
  cell: 'electronics',
  celular: 'electronics',
  samsung: 'electronics',
  xiaomi: 'electronics',
  laptop: 'electronics',
  macbook: 'electronics',
  tablet: 'electronics',
  fone: 'electronics',
  headphone: 'electronics',
  tv: 'electronics',
  televisao: 'electronics',
  monitor: 'electronics',
  videogame: 'electronics',
  playstation: 'electronics',
  xbox: 'electronics',
  // Vehicles
  carro: 'vehicles',
  car: 'vehicles',
  moto: 'vehicles',
  motorcycle: 'vehicles',
  toyota: 'vehicles',
  honda: 'vehicles',
  ford: 'vehicles',
  corolla: 'vehicles',
  civic: 'vehicles',
  hilux: 'vehicles',
  ranger: 'vehicles',
  sedan: 'vehicles',
  suv: 'vehicles',
  // Real estate
  apartamento: 'real_estate',
  apartment: 'real_estate',
  casa: 'real_estate',
  house: 'real_estate',
  aluguel: 'real_estate',
  imovel: 'real_estate',
  quarto: 'real_estate',
  // Fashion
  roupa: 'fashion',
  camisa: 'fashion',
  tenis: 'fashion',
  sapato: 'fashion',
  bolsa: 'fashion',
  // Home
  sofa: 'home_furniture',
  mesa: 'home_furniture',
  cama: 'home_furniture',
  geladeira: 'home_furniture',
  fogao: 'home_furniture',
  // Jobs
  emprego: 'jobs',
  vaga: 'jobs',
  trabalho: 'jobs',
};

export function getSuggestedCategoryForQuery(query: string): { slug: string; name: string } | null {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return null;

  // Direct keyword match
  for (const [keyword, slug] of Object.entries(KEYWORD_TO_CATEGORY)) {
    if (q.includes(keyword) || keyword.includes(q)) {
      const name = getCategoryDisplayName(slug);
      return { slug, name };
    }
  }

  return null;
}

/** Get suggested categories for a query (can return multiple matches). */
export function getSuggestedCategoriesForQuery(
  query: string,
  categories: { slug: string; name: string }[],
): { slug: string; name: string }[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const suggested: { slug: string; name: string }[] = [];
  for (const [keyword, slug] of Object.entries(KEYWORD_TO_CATEGORY)) {
    if (q.includes(keyword) || keyword.includes(q)) {
      const cat = categories.find((c) => c.slug === slug);
      if (cat && !suggested.find((s) => s.slug === slug)) {
        suggested.push({ slug: cat.slug, name: cat.name });
      }
    }
  }
  return suggested;
}

function getCategoryDisplayName(slug: string): string {
  const names: Record<string, string> = {
    vehicles: 'Vehicles',
    real_estate: 'Real Estate',
    jobs: 'Jobs',
    electronics: 'Electronics',
    home_furniture: 'Home & Furniture',
    fashion: 'Fashion',
    services: 'Services',
    others: 'Others',
  };
  return names[slug] ?? slug;
}
