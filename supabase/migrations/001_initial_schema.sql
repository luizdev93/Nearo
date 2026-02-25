-- Nearo Initial Schema
-- All tables use UUID primary keys, snake_case naming, singular table names.
-- Timestamps stored in UTC.

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL DEFAULT '',
  avatar_url    text,
  phone_number  text NOT NULL UNIQUE,
  verified      boolean NOT NULL DEFAULT false,
  rating_average numeric(2,1) NOT NULL DEFAULT 0,
  rating_count  integer NOT NULL DEFAULT 0,
  language      text NOT NULL DEFAULT 'en',
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- TABLE: listings
-- ============================================================
CREATE TABLE IF NOT EXISTS listings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          text NOT NULL,
  description    text NOT NULL,
  price          numeric(12,2) NOT NULL,
  category       text NOT NULL,
  condition      text NOT NULL CHECK (condition IN ('new', 'used')),
  negotiable     boolean NOT NULL DEFAULT false,
  location_lat   double precision,
  location_lng   double precision,
  location_name  text,
  is_featured    boolean NOT NULL DEFAULT false,
  featured_until timestamptz,
  status         text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_owner_id ON listings(owner_id);
CREATE INDEX idx_listings_category_status ON listings(category, status);
CREATE INDEX idx_listings_status_created ON listings(status, created_at DESC);
CREATE INDEX idx_listings_featured ON listings(is_featured, status) WHERE is_featured = true;

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT USING (status = 'active' OR owner_id = auth.uid());

CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own listings"
  ON listings FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own listings"
  ON listings FOR DELETE USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: listing_images
-- ============================================================
CREATE TABLE IF NOT EXISTS listing_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url        text NOT NULL,
  position   integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listing images viewable by everyone"
  ON listing_images FOR SELECT USING (true);

CREATE POLICY "Owners can insert listing images"
  ON listing_images FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can delete listing images"
  ON listing_images FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND owner_id = auth.uid())
  );

-- ============================================================
-- TABLE: chats
-- ============================================================
CREATE TABLE IF NOT EXISTS chats (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(buyer_id, seller_id, listing_id)
);

CREATE INDEX idx_chats_buyer ON chats(buyer_id);
CREATE INDEX idx_chats_seller ON chats(seller_id);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants can view chats"
  ON chats FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create chats"
  ON chats FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- ============================================================
-- TABLE: messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id    uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_id
        AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    )
  );

CREATE POLICY "Chat participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_id
        AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    )
  );

-- ============================================================
-- TABLE: message_images
-- ============================================================
CREATE TABLE IF NOT EXISTS message_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  url        text NOT NULL
);

ALTER TABLE message_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Message images viewable by chat participants"
  ON message_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chats c ON c.id = m.chat_id
      WHERE m.id = message_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "Message images insertable by sender"
  ON message_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_id AND m.sender_id = auth.uid()
    )
  );

-- ============================================================
-- TABLE: favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: ratings
-- ============================================================
CREATE TABLE IF NOT EXISTS ratings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chat_id       uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  value         smallint NOT NULL CHECK (value >= 1 AND value <= 5),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rater_id, chat_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ratings"
  ON ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- ============================================================
-- TABLE: reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id       uuid REFERENCES listings(id) ON DELETE SET NULL,
  reported_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reason           text NOT NULL CHECK (reason IN ('spam', 'scam', 'illegal', 'other')),
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can submit reports"
  ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         text NOT NULL CHECK (type IN ('new_message', 'listing_update', 'rating_received')),
  reference_id uuid,
  read         boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Auto-create user profile on auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone_number, name)
  VALUES (NEW.id, NEW.phone, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER: Recalculate user rating on new rating insert
-- ============================================================
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET
    rating_count = (SELECT COUNT(*) FROM ratings WHERE rated_user_id = NEW.rated_user_id),
    rating_average = (SELECT ROUND(AVG(value)::numeric, 1) FROM ratings WHERE rated_user_id = NEW.rated_user_id)
  WHERE id = NEW.rated_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_rating_insert
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- ============================================================
-- TRIGGER: Auto-update updated_at on listings
-- ============================================================
CREATE OR REPLACE FUNCTION update_listing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_listing_updated
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_timestamp();

-- ============================================================
-- STORAGE BUCKETS (run via Supabase dashboard or API)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- STORAGE POLICIES:
-- CREATE POLICY "Public read listing images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'listing-images');
-- CREATE POLICY "Authenticated upload listing images" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Public read profile images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'profile-images');
-- CREATE POLICY "Authenticated upload profile images" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');

-- ============================================================
-- ENABLE REALTIME for messages table
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
