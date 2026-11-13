-- ============================================================================
-- STOKE FITNESS APP — PRODUCTION DATABASE SECURITY & USER PRIVACY HARDENING
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- 
-- Complies with:
-- 1. OWASP Top 10 & CIS Benchmark for PostgreSQL / Supabase
-- 2. Strict Row Level Security (RLS) with auth.uid() isolation across all 9 tables
-- 3. Automatic user_id enforcement on INSERT using verified auth.uid()
-- 4. Immutable user_id ownership protection on UPDATE (prevents cross-user reassignment)
-- 5. Complete data isolation: no user can ever read, insert, update, or delete another user's records
-- 6. Safe idempotent execution: leaves existing athlete records intact
-- ============================================================================

-- 0. Enable cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SECURITY DEFINER IDENTITY & OWNERSHIP ENFORCEMENT FUNCTIONS
-- ============================================================================

-- Automatically set user_id to the verified auth.uid() on INSERT
-- Prevents clients from spoofing user IDs or injecting data on behalf of others
CREATE OR REPLACE FUNCTION public.enforce_auth_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure the operation is performed by an authenticated user
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Security Violation: Anonymous insert is prohibited on %', TG_TABLE_NAME;
    END IF;
    
    -- Force ownership to the verified JWT auth.uid()
    NEW.user_id := auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Prevent changing the owning user_id under any circumstance
CREATE OR REPLACE FUNCTION public.protect_user_ownership()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.user_id <> OLD.user_id THEN
            RAISE EXCEPTION 'Security Violation: Cannot reassign user_id ownership of record % on %', OLD.id, TG_TABLE_NAME;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. ENABLE AND FORCE ROW LEVEL SECURITY (RLS) ON ALL 9 TABLES
-- ============================================================================
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.running_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_xp ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meals FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.water_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workouts FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exercise_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.running_activities FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_progress FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.achievements FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_xp FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. HARDENED ROW LEVEL SECURITY (RLS) POLICIES FOR ALL 9 TABLES
-- ============================================================================

--------------------------------------------------------------------------------
-- TABLE: profiles
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_enforce_profiles_user_id ON public.profiles;
CREATE TRIGGER trg_enforce_profiles_user_id
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.enforce_auth_user_id();

DROP TRIGGER IF EXISTS trg_protect_profiles_ownership ON public.profiles;
CREATE TRIGGER trg_protect_profiles_ownership
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_ownership();

--------------------------------------------------------------------------------
-- TABLE: meals
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "meals_select_policy" ON public.meals;
DROP POLICY IF EXISTS "meals_insert_policy" ON public.meals;
DROP POLICY IF EXISTS "meals_update_policy" ON public.meals;
DROP POLICY IF EXISTS "meals_delete_policy" ON public.meals;

CREATE POLICY "meals_select_policy" ON public.meals
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "meals_insert_policy" ON public.meals
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meals_update_policy" ON public.meals
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meals_delete_policy" ON public.meals
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_enforce_meals_user_id ON public.meals;
CREATE TRIGGER trg_enforce_meals_user_id
    BEFORE INSERT ON public.meals
    FOR EACH ROW EXECUTE FUNCTION public.enforce_auth_user_id();

DROP TRIGGER IF EXISTS trg_protect_meals_ownership ON public.meals;
CREATE TRIGGER trg_protect_meals_ownership
    BEFORE UPDATE ON public.meals
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_ownership();

--------------------------------------------------------------------------------
-- TABLE: water_logs
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "water_select_policy" ON public.water_logs;
DROP POLICY IF EXISTS "water_insert_policy" ON public.water_logs;
DROP POLICY IF EXISTS "water_update_policy" ON public.water_logs;
DROP POLICY IF EXISTS "water_delete_policy" ON public.water_logs;

CREATE POLICY "water_select_policy" ON public.water_logs
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "water_insert_policy" ON public.water_logs
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "water_update_policy" ON public.water_logs
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "water_delete_policy" ON public.water_logs
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_enforce_water_user_id ON public.water_logs;
CREATE TRIGGER trg_enforce_water_user_id
    BEFORE INSERT ON public.water_logs
    FOR EACH ROW EXECUTE FUNCTION public.enforce_auth_user_id();

DROP TRIGGER IF EXISTS trg_protect_water_ownership ON public.water_logs;
CREATE TRIGGER trg_protect_water_ownership
    BEFORE UPDATE ON public.water_logs
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_ownership();

--------------------------------------------------------------------------------
-- TABLE: workouts
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "workouts_select_policy" ON public.workouts;
DROP POLICY IF EXISTS "workouts_insert_policy" ON public.workouts;
DROP POLICY IF EXISTS "workouts_update_policy" ON public.workouts;
DROP POLICY IF EXISTS "workouts_delete_policy" ON public.workouts;

CREATE POLICY "workouts_select_policy" ON public.workouts
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "workouts_insert_policy" ON public.workouts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_update_policy" ON public.workouts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_delete_policy" ON public.workouts
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_enforce_workouts_user_id ON public.workouts;
CREATE TRIGGER trg_enforce_workouts_user_id
    BEFORE INSERT ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION public.enforce_auth_user_id();

DROP TRIGGER IF EXISTS trg_protect_workouts_ownership ON public.workouts;
CREATE TRIGGER trg_protect_workouts_ownership
    BEFORE UPDATE ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_ownership();

--------------------------------------------------------------------------------
-- TABLE: exercise_logs
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "exercise_logs_select_policy" ON public.exercise_logs;
DROP POLICY IF EXISTS "exercise_logs_insert_policy" ON public.exercise_logs;
DROP POLICY IF EXISTS "exercise_logs_update_policy" ON public.exercise_logs;
DROP POLICY IF EXISTS "exercise_logs_delete_policy" ON public.exercise_logs;

CREATE POLICY "exercise_logs_select_policy" ON public.exercise_logs
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "exercise_logs_insert_policy" ON public.exercise_logs
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exercise_logs_update_policy" ON public.exercise_logs
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exercise_logs_delete_policy" ON public.exercise_logs
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_enforce_exercise_user_id ON public.exercise_logs;
CREATE TRIGGER trg_enforce_exercise_user_id
    BEFORE INSERT ON public.exercise_logs
    FOR EACH ROW EXECUTE FUNCTION public.enforce_auth_user_id();

DROP TRIGGER IF EXISTS trg_protect_exercise_ownership ON public.exercise_logs;
CREATE TRIGGER trg_protect_exercise_ownership
    BEFORE UPDATE ON public.exercise_logs
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_ownership();

--------------------------------------------------------------------------------
-- TABLE: running_activities
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "running_select_policy" ON public.running_activities;
DROP POLICY IF EXISTS "running_insert_policy" ON public.running_activities;
DROP POLICY IF EXISTS "running_update_policy" ON public.running_activities;
DROP POLICY IF EXISTS "running_delete_policy" ON public.running_activities;

CREATE POLICY "running_select_policy" ON public.running_activities
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "running_insert_policy" ON public.running_activities
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "running_update_policy" ON public.running_activities
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "running_delete_policy" ON public.running_activities
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_enforce_running_user_id ON public.running_activities;
CREATE TRIGGER trg_enforce_running_user_id
    BEFORE INSERT ON public.running_activities
    FOR EACH ROW EXECUTE FUNCTION public.enforce_auth_user_id();

DROP TRIGGER IF EXISTS trg_protect_running_ownership ON public.running_activities;
CREATE TRIGGER trg_protect_running_ownership
    BEFORE UPDATE ON public.running_activities
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_ownership();

--------------------------------------------------------------------------------
-- TABLE: daily_progress
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "daily_progress_select_policy" ON public.daily_progress;
DROP POLICY IF EXISTS "daily_progress_insert_policy" ON public.daily_progress;
DROP POLICY IF EXISTS "daily_progress_update_policy" ON public.daily_progress;
DROP POLICY IF EXISTS "daily_progress_delete_policy" ON public.daily_progress;

CREATE POLICY "daily_progress_select_policy" ON public.daily_progress
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "daily_progress_insert_policy" ON public.daily_progress
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_progress_update_policy" ON public.daily_progress
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_progress_delete_policy" ON public.daily_progress
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_enforce_progress_user_id ON public.daily_progress;
CREATE TRIGGER trg_enforce_progress_user_id
    BEFORE INSERT ON public.daily_progress
    FOR EACH ROW EXECUTE FUNCTION public.enforce_auth_user_id();

DROP TRIGGER IF EXISTS trg_protect_progress_ownership ON public.daily_progress;
CREATE TRIGGER trg_protect_progress_ownership
    BEFORE UPDATE ON public.daily_progress
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_ownership();

--------------------------------------------------------------------------------
-- TABLE: achievements
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "achievements_select_policy" ON public.achievements;
DROP POLICY IF EXISTS "achievements_insert_policy" ON public.achievements;
DROP POLICY IF EXISTS "achievements_update_policy" ON public.achievements;
DROP POLICY IF EXISTS "achievements_delete_policy" ON public.achievements;

CREATE POLICY "achievements_select_policy" ON public.achievements
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "achievements_insert_policy" ON public.achievements
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "achievements_update_policy" ON public.achievements
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "achievements_delete_policy" ON public.achievements
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_enforce_achievements_user_id ON public.achievements;
CREATE TRIGGER trg_enforce_achievements_user_id
    BEFORE INSERT ON public.achievements
    FOR EACH ROW EXECUTE FUNCTION public.enforce_auth_user_id();

DROP TRIGGER IF EXISTS trg_protect_achievements_ownership ON public.achievements;
CREATE TRIGGER trg_protect_achievements_ownership
    BEFORE UPDATE ON public.achievements
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_ownership();

--------------------------------------------------------------------------------
-- TABLE: user_xp
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_xp_select_policy" ON public.user_xp;
DROP POLICY IF EXISTS "user_xp_insert_policy" ON public.user_xp;
DROP POLICY IF EXISTS "user_xp_update_policy" ON public.user_xp;
DROP POLICY IF EXISTS "user_xp_delete_policy" ON public.user_xp;

CREATE POLICY "user_xp_select_policy" ON public.user_xp
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "user_xp_insert_policy" ON public.user_xp
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_xp_update_policy" ON public.user_xp
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_xp_delete_policy" ON public.user_xp
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_enforce_user_xp_user_id ON public.user_xp;
CREATE TRIGGER trg_enforce_user_xp_user_id
    BEFORE INSERT ON public.user_xp
    FOR EACH ROW EXECUTE FUNCTION public.enforce_auth_user_id();

DROP TRIGGER IF EXISTS trg_protect_user_xp_ownership ON public.user_xp;
CREATE TRIGGER trg_protect_user_xp_ownership
    BEFORE UPDATE ON public.user_xp
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_ownership();

-- ============================================================================
-- 4. SECURE AUTOMATED USER INITIALIZATION VIA AUTH HOOK
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically create a default profile for new user with secure ownership
    INSERT INTO public.profiles (user_id, name, email, age, height, weight, fitness_goal, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal, daily_fiber_goal, daily_water_goal)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Athlete'),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'age')::integer, 25),
        COALESCE((NEW.raw_user_meta_data->>'height')::numeric, 175),
        COALESCE((NEW.raw_user_meta_data->>'weight')::numeric, 70),
        COALESCE(NEW.raw_user_meta_data->>'fitness_goal', 'maintain'),
        2400,
        160,
        240,
        65,
        30,
        2.6
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Automatically seed clean zero XP entry for newly registered user
    INSERT INTO public.user_xp (user_id, xp, current_xp, level, current_level, fitness_score, next_level_xp)
    VALUES (NEW.id, 0, 0, 1, 1, 0, 500)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Rebind trigger safely to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 5. ATOMIC USER ACCOUNT DELETION (DPDP ACT 2023 SEC 12(3) & APPLE GUIDELINE 5.1.1(v))
-- ============================================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS json AS $$
DECLARE
    uid uuid;
BEGIN
    uid := auth.uid();
    IF uid IS NULL THEN
        RAISE EXCEPTION 'Security Violation: Cannot delete account without authenticated session';
    END IF;

    -- Delete all user records across all 9 tables in one transaction
    DELETE FROM public.exercise_logs WHERE user_id = uid;
    DELETE FROM public.workouts WHERE user_id = uid;
    DELETE FROM public.meals WHERE user_id = uid;
    DELETE FROM public.water_logs WHERE user_id = uid;
    DELETE FROM public.running_activities WHERE user_id = uid;
    DELETE FROM public.daily_progress WHERE user_id = uid;
    DELETE FROM public.achievements WHERE user_id = uid;
    DELETE FROM public.user_xp WHERE user_id = uid;
    DELETE FROM public.profiles WHERE user_id = uid;

    RETURN json_build_object('success', true, 'user_id', uid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- ============================================================================
-- 6. SUPABASE STORAGE BUCKET ROW LEVEL SECURITY (meal-photos)
-- ============================================================================

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-photos', 'meal-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage RLS: Users can only upload, read, update, or delete objects in their own folder (auth.uid()/)
DROP POLICY IF EXISTS "meal_photos_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "meal_photos_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "meal_photos_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "meal_photos_delete_policy" ON storage.objects;

CREATE POLICY "meal_photos_select_policy" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "meal_photos_insert_policy" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "meal_photos_update_policy" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1])
    WITH CHECK (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "meal_photos_delete_policy" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- 7. VERIFICATION AND HEALTH CHECK QUERIES
-- ============================================================================
-- Verify RLS status on all public tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--
-- Verify all active RLS policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, cmd;
-- ============================================================================
