import { supabase } from './api/supabase_client';
import { ServiceResponse } from './auth_service';
import type {
  Category,
  CategoryTemplate,
  CategoryTemplateAttribute,
} from '../models/category_engine';

const TREE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 min
const TEMPLATE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

let treeCache: { data: Category[]; ts: number } | null = null;
const templateCache = new Map<string, { data: CategoryTemplate; ts: number }>();

export const categoryService = {
  /**
   * Get full category tree (roots with nested children).
   * Cached for TREE_CACHE_TTL_MS.
   */
  async getTree(): Promise<ServiceResponse<Category[]>> {
    const now = Date.now();
    if (treeCache && now - treeCache.ts < TREE_CACHE_TTL_MS) {
      return { data: treeCache.data, error: null };
    }
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) return { data: null, error: error.message };

      const rows = (data ?? []) as Category[];
      const byParent = new Map<string | null, Category[]>();
      for (const c of rows) {
        const pid = c.parent_id ?? null;
        if (!byParent.has(pid)) byParent.set(pid, []);
        byParent.get(pid)!.push({ ...c, children: [] });
      }
      const roots = (byParent.get(null) ?? []).sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      function nest(children: Category[]) {
        for (const c of children) {
          c.children = (byParent.get(c.id) ?? []).sort(
            (a, b) => a.sort_order - b.sort_order,
          );
          nest(c.children);
        }
      }
      nest(roots);
      treeCache = { data: roots, ts: now };
      return { data: roots, error: null };
    } catch {
      return { data: null, error: 'Failed to load category tree' };
    }
  },

  /**
   * Get leaf categories (no other category has this as parent_id). For MVP, all seeded categories are leaves.
   */
  async getLeafCategories(): Promise<ServiceResponse<Category[]>> {
    try {
      const { data: all, error: allError } = await supabase
        .from('categories')
        .select('id, parent_id');
      if (allError) return { data: null, error: allError.message };
      const rows = (all ?? []) as { id: string; parent_id: string | null }[];
      const parentIds = new Set(rows.map((r) => r.parent_id).filter(Boolean));
      const leafIds = rows.filter((r) => !parentIds.has(r.id)).map((r) => r.id);
      if (leafIds.length === 0) return { data: [], error: null };

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .in('id', leafIds)
        .order('sort_order', { ascending: true });

      if (error) return { data: null, error: error.message };
      return { data: (data ?? []) as Category[], error: null };
    } catch {
      return { data: null, error: 'Failed to load leaf categories' };
    }
  },

  /**
   * Get template for a leaf category: attributes + options (for form and filters).
   * Cached per category for TEMPLATE_CACHE_TTL_MS.
   */
  async getTemplate(categoryId: string): Promise<ServiceResponse<CategoryTemplate>> {
    const now = Date.now();
    const cached = templateCache.get(categoryId);
    if (cached && now - cached.ts < TEMPLATE_CACHE_TTL_MS) {
      return { data: cached.data, error: null };
    }
    try {
      const { data: cat, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', categoryId)
        .single();

      if (catError || !cat) {
        return { data: null, error: catError?.message ?? 'Category not found' };
      }

      const { data: attrs, error: attrError } = await supabase
        .from('attributes')
        .select('*')
        .eq('category_id', categoryId)
        .order('sort_order', { ascending: true });

      if (attrError) return { data: null, error: attrError.message };
      const attributeRows = attrs ?? [];

      const attrIds = attributeRows.map((a: { id: string }) => a.id);
      const { data: opts, error: optsError } = await supabase
        .from('attribute_options')
        .select('*')
        .in('attribute_id', attrIds.length ? attrIds : ['']);

      if (optsError) return { data: null, error: optsError.message };
      const optionsByAttr = new Map<string, typeof opts>();
      for (const o of opts ?? []) {
        const aid = (o as { attribute_id: string }).attribute_id;
        if (!optionsByAttr.has(aid)) optionsByAttr.set(aid, []);
        optionsByAttr.get(aid)!.push(o);
      }

      const attributes: CategoryTemplateAttribute[] = attributeRows.map(
        (a: Record<string, unknown>) => ({
          id: a.id as string,
          key: a.key as string,
          type: a.type as CategoryTemplateAttribute['type'],
          label_en: (a.label_en as string | null) ?? null,
          label_vi: (a.label_vi as string | null) ?? null,
          required: (a.required as boolean) ?? false,
          filterable: (a.filterable as boolean) ?? false,
          sortable: (a.sortable as boolean) ?? false,
          unit: (a.unit as string | null) ?? null,
          depends_on: (a.depends_on as string | null) ?? null,
          sort_order: (a.sort_order as number) ?? 0,
          options: (optionsByAttr.get(a.id as string) ?? []).map(
            (o: Record<string, unknown>) => ({
              value: o.value as string,
              label_en: (o.label_en as string | null) ?? null,
              label_vi: (o.label_vi as string | null) ?? null,
              parent_value: (o.parent_value as string | null) ?? null,
            }),
          ),
        }),
      );

      const template: CategoryTemplate = {
        category_id: cat.id,
        category_name: cat.name,
        category_slug: cat.slug,
        attributes,
      };
      templateCache.set(categoryId, { data: template, ts: now });
      return { data: template, error: null };
    } catch {
      return { data: null, error: 'Failed to load category template' };
    }
  },
};
