-- ==============================================================================
-- STOKE APP: SUPABASE PROFILES TABLE ROW-LEVEL SECURITY & SCHEMA FIX
-- ==============================================================================
-- Purpose:
-- 1. Ensure table public.profiles has correct constraints and unique user_id.
-- 2. Enable Row-Level Security (RLS) on public.profiles.
-- 3. Define secure, idempotent policies allowing authenticated users to select,
--    insert, update, and delete ONLY their own profile (auth.uid() = user_id).
-- 4. Provide a SECURITY DEFINER trigger to auto-create user profile on signup
--    without violating RLS policies.
-- ==============================================================================

-- 1. Create table public.profiles if it does not already exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Athlete',
    email TEXT,
    age INT DEFAULT 28,
    height NUMERIC(5,2) DEFAULT 175.0,
    weight NUMERIC(5,2) DEFAULT 75.0,
    gender TEXT DEFAULT 'not_specified',
    fitness_goal TEXT DEFAULT 'Maintain Fitness',
    daily_calorie_goal INT DEFAULT 2400,
    daily_protein_goal INT DEFAULT 160,
    daily_carbs_goal INT DEFAULT 250,
    daily_fat_goal INT DEFAULT 70,
    daily_fiber_goal INT DEFAULT 35,
    daily_water_goal NUMERIC(4,2) DEFAULT 3.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure UNIQUE constraint on user_id exists if the table was created earlier without it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_key' 
          AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop any outdated, insecure, or duplicate policies on public.profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile." ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_policy_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated full access to own profile" ON public.profiles;

-- 4. Create explicit, isolated RLS policies for authenticated users
-- (a) SELECT: Users can only view their own profile
CREATE POLICY "profiles_select_own"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- (b) INSERT: Users can only insert a row with their own auth.uid()
CREATE POLICY "profiles_insert_own"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- (c) UPDATE: Users can only update their own row and cannot alter user_id to someone else's
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- (d) DELETE: Users can only delete their own row
CREATE POLICY "profiles_delete_own"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. Auto-Profile Creation Trigger on new auth.users signup
-- Runs with SECURITY DEFINER so it can insert the initial row safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    name,
    email,
    fitness_goal,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Athlete'),
    NEW.email,
    'Maintain Fitness',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant appropriate privileges to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
