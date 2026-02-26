-- ============================================================
-- Migration 003: Dynamic Category Engine
-- Categories, attributes, attribute_options, listing_attribute_values,
-- listings.category_id, geo index. No app logic change in this file.
-- ============================================================

-- PostGIS for distance filter/sort (optional; skip if not available)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- TABLE: categories (hierarchy; only leaf categories for listings)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id  uuid REFERENCES categories(id) ON DELETE CASCADE,
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  icon       text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

-- ============================================================
-- SEED: categories (leaf-only for MVP; slug matches current app)
-- ============================================================
INSERT INTO categories (parent_id, name, slug, icon, sort_order) VALUES
  (NULL, 'Vehicles', 'vehicles', 'car', 1),
  (NULL, 'Real Estate', 'real_estate', 'home', 2),
  (NULL, 'Jobs', 'jobs', 'briefcase', 3),
  (NULL, 'Electronics', 'electronics', 'laptop', 4),
  (NULL, 'Home & Furniture', 'home_furniture', 'bed', 5),
  (NULL, 'Fashion', 'fashion', 'shirt', 6),
  (NULL, 'Services', 'services', 'construct', 7),
  (NULL, 'Others', 'others', 'ellipsis-horizontal', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TABLE: attributes (per leaf category)
-- ============================================================
CREATE TABLE IF NOT EXISTS attributes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  key            text NOT NULL,
  type           text NOT NULL CHECK (type IN ('select','multiselect','number','number_range','boolean','text','location')),
  label_en       text,
  label_vi       text,
  required       boolean NOT NULL DEFAULT false,
  filterable     boolean NOT NULL DEFAULT false,
  sortable       boolean NOT NULL DEFAULT false,
  unit           text,
  depends_on     text,
  options_source text,
  sort_order     int NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(category_id, key)
);

CREATE INDEX idx_attributes_category ON attributes(category_id);
CREATE INDEX idx_attributes_category_key ON attributes(category_id, key);

ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attributes are viewable by everyone"
  ON attributes FOR SELECT USING (true);

-- depends_on stores the key of another attribute in same category (no FK; key is unique per category).

-- ============================================================
-- TABLE: attribute_options
-- ============================================================
CREATE TABLE IF NOT EXISTS attribute_options (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id uuid NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  parent_value text,
  value       text NOT NULL,
  label_en    text,
  label_vi    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_attribute_options_attr ON attribute_options(attribute_id);
CREATE INDEX idx_attribute_options_attr_parent ON attribute_options(attribute_id, parent_value);

ALTER TABLE attribute_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attribute options are viewable by everyone"
  ON attribute_options FOR SELECT USING (true);

-- ============================================================
-- SEED: attributes and options for Vehicles and Electronics
-- ============================================================
INSERT INTO attributes (category_id, key, type, label_en, label_vi, required, filterable, sortable, unit, sort_order)
SELECT c.id, a.key, a.type, a.label_en, a.label_vi, a.required, a.filterable, a.sortable, a.unit, a.sort_order
FROM (VALUES
  ('vehicles', 'brand', 'select', 'Brand', 'Hãng', true, true, false, null::text, 1),
  ('vehicles', 'model', 'select', 'Model', 'Mẫu', false, true, false, null, 2),
  ('vehicles', 'year_min', 'number', 'Year (min)', 'Năm (từ)', false, true, false, null, 3),
  ('vehicles', 'year_max', 'number', 'Year (max)', 'Năm (đến)', false, true, false, null, 4),
  ('vehicles', 'mileage', 'number', 'Mileage (km)', 'Số km', false, true, false, 'km', 5),
  ('vehicles', 'fuel_type', 'select', 'Fuel type', 'Nhiên liệu', false, true, false, null, 6),
  ('vehicles', 'transmission', 'select', 'Transmission', 'Hộp số', false, true, false, null, 7)
) AS a(slug, key, type, label_en, label_vi, required, filterable, sortable, unit, sort_order)
JOIN categories c ON c.slug = a.slug
ON CONFLICT (category_id, key) DO NOTHING;

UPDATE attributes SET depends_on = 'brand' WHERE key = 'model' AND category_id = (SELECT id FROM categories WHERE slug = 'vehicles' LIMIT 1);

-- Vehicle brand options
INSERT INTO attribute_options (attribute_id, value, label_en, label_vi)
SELECT att.id, o.value, o.label_en, o.label_vi
FROM (VALUES ('toyota','Toyota','Toyota'), ('honda','Honda','Honda'), ('ford','Ford','Ford'), ('bmw','BMW','BMW'), ('other','Other','Khác')) AS o(value, label_en, label_vi),
     attributes att
JOIN categories c ON c.id = att.category_id AND c.slug = 'vehicles' AND att.key = 'brand';

-- Vehicle model options (dependent on brand) - need unique on (attribute_id, parent_value, value) for ON CONFLICT
INSERT INTO attribute_options (attribute_id, parent_value, value, label_en, label_vi)
SELECT att.id, o.parent_value, o.value, o.label_en, o.label_vi
FROM (VALUES
  ('toyota','corolla','Corolla','Corolla'), ('toyota','camry','Camry','Camry'), ('toyota','hilux','Hilux','Hilux'),
  ('honda','civic','Civic','Civic'), ('honda','accord','Accord','Accord'),
  ('ford','ranger','Ranger','Ranger'), ('ford','everest','Everest','Everest')
) AS o(parent_value, value, label_en, label_vi),
     attributes att
JOIN categories c ON c.id = att.category_id AND c.slug = 'vehicles' AND att.key = 'model';

-- Fuel type and transmission (no unique on attribute_options - allow duplicate inserts to be skipped via separate logic or leave as single run)
INSERT INTO attribute_options (attribute_id, value, label_en, label_vi)
SELECT att.id, o.value, o.label_en, o.label_vi
FROM (VALUES
  ('fuel_type','petrol','Petrol','Xăng'), ('fuel_type','diesel','Diesel','Dầu'), ('fuel_type','electric','Electric','Điện'), ('fuel_type','hybrid','Hybrid','Hybrid'),
  ('transmission','manual','Manual','Số tay'), ('transmission','automatic','Automatic','Tự động')
) AS o(key, value, label_en, label_vi),
     attributes att
JOIN categories c ON c.id = att.category_id AND c.slug = 'vehicles' AND att.key = o.key;

-- Electronics
INSERT INTO attributes (category_id, key, type, label_en, label_vi, required, filterable, sortable, unit, sort_order)
SELECT c.id, a.key, a.type, a.label_en, a.label_vi, a.required, a.filterable, a.sortable, a.unit, a.sort_order
FROM (VALUES
  ('electronics', 'brand', 'select', 'Brand', 'Hãng', false, true, false, null::text, 1),
  ('electronics', 'warranty', 'boolean', 'Under warranty', 'Còn bảo hành', false, true, false, null, 2)
) AS a(slug, key, type, label_en, label_vi, required, filterable, sortable, unit, sort_order)
JOIN categories c ON c.slug = a.slug
ON CONFLICT (category_id, key) DO NOTHING;

INSERT INTO attribute_options (attribute_id, value, label_en, label_vi)
SELECT att.id, o.value, o.label_en, o.label_vi
FROM (VALUES ('apple','Apple','Apple'), ('samsung','Samsung','Samsung'), ('xiaomi','Xiaomi','Xiaomi'), ('other','Other','Khác')) AS o(value, label_en, label_vi),
     attributes att
JOIN categories c ON c.id = att.category_id AND c.slug = 'electronics' AND att.key = 'brand';

-- ============================================================
-- TABLE: listing_attribute_values (EAV)
-- ============================================================
CREATE TABLE IF NOT EXISTS listing_attribute_values (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  attribute_id uuid NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  value        text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(listing_id, attribute_id)
);

CREATE INDEX idx_listing_attr_values_listing ON listing_attribute_values(listing_id);
CREATE INDEX idx_listing_attr_values_attr_value ON listing_attribute_values(attribute_id, value);

ALTER TABLE listing_attribute_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listing attribute values viewable by everyone"
  ON listing_attribute_values FOR SELECT USING (true);

CREATE POLICY "Listing owners can insert attribute values"
  ON listing_attribute_values FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND owner_id = auth.uid())
  );

CREATE POLICY "Listing owners can update attribute values"
  ON listing_attribute_values FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND owner_id = auth.uid())
  );

CREATE POLICY "Listing owners can delete attribute values"
  ON listing_attribute_values FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND owner_id = auth.uid())
  );

-- ============================================================
-- ALTER listings: add category_id, backfill, keep category for compat
-- ============================================================
ALTER TABLE listings ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- Backfill category_id from existing category text (slug)
UPDATE listings l
SET category_id = c.id
FROM categories c
WHERE c.slug = l.category AND l.category_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id_status ON listings(category_id, status);

-- ============================================================
-- Geo: GIST index for distance (PostGIS). Skip if PostGIS failed.
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    CREATE INDEX IF NOT EXISTS idx_listings_location_geo
      ON listings
      USING GIST (ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)::geography)
      WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- ignore if PostGIS or index fails
END
$$;
