-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_owner_select" ON profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "profiles_owner_insert" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_owner_update" ON profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- Create tax_settings table
CREATE TABLE tax_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estimated_tax_rate DECIMAL(5,2) DEFAULT 30.00,
  mileage_rate DECIMAL(5,2) DEFAULT 0.67,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tax_settings_owner_select" ON tax_settings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tax_settings_owner_insert" ON tax_settings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tax_settings_owner_update" ON tax_settings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_tax_settings_user_id ON tax_settings(user_id);
GRANT SELECT, INSERT, UPDATE ON tax_settings TO authenticated;

-- Enable RLS on existing tables
ALTER TABLE earnings_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

-- RLS policies for earnings_entries
CREATE POLICY "entries_owner_select" ON earnings_entries
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "entries_owner_insert" ON earnings_entries
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "entries_owner_update" ON earnings_entries
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "entries_owner_delete" ON earnings_entries
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON earnings_entries TO authenticated;

-- RLS policies for expenses
CREATE POLICY "expenses_owner_select" ON expenses
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "expenses_owner_insert" ON expenses
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "expenses_owner_update" ON expenses
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "expenses_owner_delete" ON expenses
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO authenticated;

-- RLS policies for platforms
CREATE POLICY "platforms_owner_select" ON platforms
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "platforms_owner_insert" ON platforms
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "platforms_owner_update" ON platforms
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "platforms_owner_delete" ON platforms
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON platforms TO authenticated;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO authenticated;
