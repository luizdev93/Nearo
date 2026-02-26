-- ============================================================
-- Migration 002: Support OAuth users (Google) - email instead of phone
-- ============================================================

-- Make phone_number nullable for OAuth-only users
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;

-- Drop existing trigger and function to recreate with OAuth support
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate handle_new_user: supports both phone OTP and OAuth (Google)
-- OAuth users have email, not phone. Use email or placeholder for phone_number.
-- Avatar URL from Google is stored in raw_user_meta_data.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone_number, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.email, 'oauth_' || NEW.id::text),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
