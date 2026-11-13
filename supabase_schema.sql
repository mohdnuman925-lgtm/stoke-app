-- ============================================================================
-- STOKE FITNESS APP — SAFE MIGRATION & COMPLETE DATABASE SCHEMA
-- Run this script in your Supabase Project's SQL Editor (Dashboard -> SQL Editor)
-- Fully idempotent: safe to run on an existing or new Supabase database.
-- ============================================================================

-- 0. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE & MIGRATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL DEFAULT 'Athlete',
    email TEXT,
    age INTEGER DEFAULT 25,
    height NUMERIC DEFAULT 175,
    weight NUMERIC DEFAULT 70,
    gender TEXT DEFAULT 'not_specified',
    fitness_goal TEXT DEFAULT 'maintain',
    daily_calorie_goal INTEGER DEFAULT 2400,
    daily_protein_goal INTEGER DEFAULT 160,
    daily_carbs_goal INTEGER DEFAULT 240,
    daily_fat_goal INTEGER DEFAULT 65,
    daily_fiber_goal INTEGER DEFAULT 30,
    daily_water_goal NUMERIC DEFAULT 2.6,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe column additions for profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm NUMERIC DEFAULT 175;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg NUMERIC DEFAULT 70;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'maintain';

-- ============================================================================
-- 2. MEALS TABLE & MIGRATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_name TEXT NOT NULL,
    meal_type TEXT NOT NULL DEFAULT 'lunch', -- 'breakfast', 'lunch', 'dinner', 'snack'
    food_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    calories NUMERIC NOT NULL DEFAULT 0,
    protein NUMERIC NOT NULL DEFAULT 0,
    carbs NUMERIC NOT NULL DEFAULT 0,
    fat NUMERIC NOT NULL DEFAULT 0,
    fiber NUMERIC NOT NULL DEFAULT 0,
    quantity NUMERIC DEFAULT 100,
    image_url TEXT,
    meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_time TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe column additions for meals
ALTER TABLE public.meals ADD COLUMN IF NOT EXISTS food_name TEXT;
ALTER TABLE public.meals ADD COLUMN IF NOT EXISTS grams NUMERIC DEFAULT 100;
ALTER TABLE public.meals ADD COLUMN IF NOT EXISTS meal_time TEXT;

-- Auto-sync food_name with meal_name if one is missing
CREATE OR REPLACE FUNCTION public.sync_meal_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.meal_name IS NULL OR NEW.meal_name = '' THEN
        NEW.meal_name := COALESCE(NEW.food_name, 'Meal');
    END IF;
    IF NEW.food_name IS NULL OR NEW.food_name = '' THEN
        NEW.food_name := NEW.meal_name;
    END IF;
    IF NEW.quantity IS NULL THEN
        NEW.quantity := COALESCE(NEW.grams, 100);
    END IF;
    IF NEW.grams IS NULL THEN
        NEW.grams := COALESCE(NEW.quantity, 100);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_meal_fields ON public.meals;
CREATE TRIGGER trg_sync_meal_fields
    BEFORE INSERT OR UPDATE ON public.meals
    FOR EACH ROW EXECUTE FUNCTION public.sync_meal_fields();

-- ============================================================================
-- 3. WATER LOGS TABLE & MIGRATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_ml NUMERIC NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. WORKOUTS TABLE & MIGRATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_name TEXT NOT NULL DEFAULT 'Workout',
    workout_type TEXT DEFAULT 'strength',
    duration INTEGER DEFAULT 0, -- duration in minutes
    calories_burned NUMERIC DEFAULT 0,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe column additions for workouts
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS program_name TEXT DEFAULT 'Classic Split';
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS day_name TEXT DEFAULT 'Chest & Triceps';
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Auto-sync workout fields
CREATE OR REPLACE FUNCTION public.sync_workout_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.workout_name IS NULL OR NEW.workout_name = '' THEN
        NEW.workout_name := COALESCE(NEW.day_name, NEW.program_name, 'Workout');
    END IF;
    IF NEW.duration IS NULL OR NEW.duration = 0 THEN
        NEW.duration := COALESCE(NEW.duration_minutes, 0);
    END IF;
    IF NEW.duration_minutes IS NULL OR NEW.duration_minutes = 0 THEN
        NEW.duration_minutes := COALESCE(NEW.duration, 0);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_workout_fields ON public.workouts;
CREATE TRIGGER trg_sync_workout_fields
    BEFORE INSERT OR UPDATE ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION public.sync_workout_fields();

-- ============================================================================
-- 5. EXERCISE LOGS TABLE & MIGRATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    sets JSONB DEFAULT '[]'::jsonb,
    reps INTEGER DEFAULT 0,
    weight NUMERIC DEFAULT 0,
    duration INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe column additions for exercise logs
ALTER TABLE public.exercise_logs ADD COLUMN IF NOT EXISTS set_number INTEGER DEFAULT 1;
ALTER TABLE public.exercise_logs ADD COLUMN IF NOT EXISTS weight_kg NUMERIC DEFAULT 0;

-- Auto-sync exercise log weights
CREATE OR REPLACE FUNCTION public.sync_exercise_log_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.weight IS NULL OR NEW.weight = 0 THEN
        NEW.weight := COALESCE(NEW.weight_kg, 0);
    END IF;
    IF NEW.weight_kg IS NULL OR NEW.weight_kg = 0 THEN
        NEW.weight_kg := COALESCE(NEW.weight, 0);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_exercise_log_fields ON public.exercise_logs;
CREATE TRIGGER trg_sync_exercise_log_fields
    BEFORE INSERT OR UPDATE ON public.exercise_logs
    FOR EACH ROW EXECUTE FUNCTION public.sync_exercise_log_fields();

-- ============================================================================
-- 6. RUNNING ACTIVITIES TABLE & MIGRATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.running_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    distance_km NUMERIC NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    average_pace NUMERIC DEFAULT 0, -- minutes per km
    average_speed NUMERIC DEFAULT 0, -- km/h
    calories_burned NUMERIC DEFAULT 0,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    route_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.running_activities ADD COLUMN IF NOT EXISTS pace_seconds_per_km NUMERIC DEFAULT 0;
ALTER TABLE public.running_activities ADD COLUMN IF NOT EXISTS route_coordinates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.running_activities ADD COLUMN IF NOT EXISTS sport_type TEXT DEFAULT 'run';
ALTER TABLE public.running_activities ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Live GPS Activity';
ALTER TABLE public.running_activities ADD COLUMN IF NOT EXISTS max_speed NUMERIC DEFAULT 0;
ALTER TABLE public.running_activities ADD COLUMN IF NOT EXISTS elevation_gain NUMERIC DEFAULT 0;
ALTER TABLE public.running_activities ADD COLUMN IF NOT EXISTS splits_data JSONB DEFAULT '[]'::jsonb;

-- Auto-sync route data
CREATE OR REPLACE FUNCTION public.sync_running_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.route_data IS NULL OR NEW.route_data = '[]'::jsonb) AND NEW.route_coordinates IS NOT NULL THEN
        NEW.route_data := NEW.route_coordinates;
    END IF;
    IF (NEW.route_coordinates IS NULL OR NEW.route_coordinates = '[]'::jsonb) AND NEW.route_data IS NOT NULL THEN
        NEW.route_coordinates := NEW.route_data;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_running_fields ON public.running_activities;
CREATE TRIGGER trg_sync_running_fields
    BEFORE INSERT OR UPDATE ON public.running_activities
    FOR EACH ROW EXECUTE FUNCTION public.sync_running_fields();

-- ============================================================================
-- 7. DAILY PROGRESS TABLE & MIGRATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    calories_consumed NUMERIC DEFAULT 0,
    protein NUMERIC DEFAULT 0,
    carbs NUMERIC DEFAULT 0,
    fat NUMERIC DEFAULT 0,
    fiber NUMERIC DEFAULT 0,
    water_ml NUMERIC DEFAULT 0,
    calories_burned NUMERIC DEFAULT 0,
    steps INTEGER DEFAULT 0,
    workout_minutes INTEGER DEFAULT 0,
    running_distance NUMERIC DEFAULT 0,
    CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Safe column additions for daily progress
ALTER TABLE public.daily_progress ADD COLUMN IF NOT EXISTS water_intake_liters NUMERIC DEFAULT 0;
ALTER TABLE public.daily_progress ADD COLUMN IF NOT EXISTS weight_kg NUMERIC;
ALTER TABLE public.daily_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- 8. ACHIEVEMENTS TABLE & MIGRATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_name TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_name)
);

-- Safe column additions for achievements
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS badge_name TEXT;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS badge_description TEXT DEFAULT '';
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🏆';

-- Auto-sync achievement fields
CREATE OR REPLACE FUNCTION public.sync_achievement_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.achievement_name IS NULL OR NEW.achievement_name = '' THEN
        NEW.achievement_name := COALESCE(NEW.badge_name, 'Achievement');
    END IF;
    IF NEW.badge_name IS NULL OR NEW.badge_name = '' THEN
        NEW.badge_name := NEW.achievement_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_achievement_fields ON public.achievements;
CREATE TRIGGER trg_sync_achievement_fields
    BEFORE INSERT OR UPDATE ON public.achievements
    FOR EACH ROW EXECUTE FUNCTION public.sync_achievement_fields();

-- ============================================================================
-- 9. USER XP TABLE & MIGRATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_xp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    xp INTEGER NOT NULL DEFAULT 2450,
    level INTEGER NOT NULL DEFAULT 8,
    fitness_score INTEGER NOT NULL DEFAULT 78,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe column additions for user XP
ALTER TABLE public.user_xp ADD COLUMN IF NOT EXISTS current_xp INTEGER DEFAULT 2450;
ALTER TABLE public.user_xp ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 8;
ALTER TABLE public.user_xp ADD COLUMN IF NOT EXISTS next_level_xp INTEGER DEFAULT 3000;

-- Auto-sync XP fields
CREATE OR REPLACE FUNCTION public.sync_user_xp_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.xp IS NULL THEN
        NEW.xp := COALESCE(NEW.current_xp, 2450);
    END IF;
    IF NEW.current_xp IS NULL THEN
        NEW.current_xp := COALESCE(NEW.xp, 2450);
    END IF;
    IF NEW.level IS NULL THEN
        NEW.level := COALESCE(NEW.current_level, 8);
    END IF;
    IF NEW.current_level IS NULL THEN
        NEW.current_level := COALESCE(NEW.level, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_user_xp_fields ON public.user_xp;
CREATE TRIGGER trg_sync_user_xp_fields
    BEFORE INSERT OR UPDATE ON public.user_xp
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_xp_fields();

-- ============================================================================
-- 10. INDEXES FOR FAST QUERYING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON public.meals(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_water_user_date ON public.water_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user ON public.exercise_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_running_user_date ON public.running_activities(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON public.daily_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_xp_user ON public.user_xp(user_id);

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES — STRICT USER ISOLATION
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- MEALS RLS
DROP POLICY IF EXISTS "meals_select_policy" ON public.meals;
CREATE POLICY "meals_select_policy" ON public.meals FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "meals_insert_policy" ON public.meals;
CREATE POLICY "meals_insert_policy" ON public.meals FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "meals_update_policy" ON public.meals;
CREATE POLICY "meals_update_policy" ON public.meals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "meals_delete_policy" ON public.meals;
CREATE POLICY "meals_delete_policy" ON public.meals FOR DELETE USING (auth.uid() = user_id);

-- WATER LOGS RLS
DROP POLICY IF EXISTS "water_select_policy" ON public.water_logs;
CREATE POLICY "water_select_policy" ON public.water_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "water_insert_policy" ON public.water_logs;
CREATE POLICY "water_insert_policy" ON public.water_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "water_update_policy" ON public.water_logs;
CREATE POLICY "water_update_policy" ON public.water_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "water_delete_policy" ON public.water_logs;
CREATE POLICY "water_delete_policy" ON public.water_logs FOR DELETE USING (auth.uid() = user_id);

-- WORKOUTS RLS
DROP POLICY IF EXISTS "workouts_select_policy" ON public.workouts;
CREATE POLICY "workouts_select_policy" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "workouts_insert_policy" ON public.workouts;
CREATE POLICY "workouts_insert_policy" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "workouts_update_policy" ON public.workouts;
CREATE POLICY "workouts_update_policy" ON public.workouts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "workouts_delete_policy" ON public.workouts;
CREATE POLICY "workouts_delete_policy" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- EXERCISE LOGS RLS
DROP POLICY IF EXISTS "exercise_logs_select_policy" ON public.exercise_logs;
CREATE POLICY "exercise_logs_select_policy" ON public.exercise_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "exercise_logs_insert_policy" ON public.exercise_logs;
CREATE POLICY "exercise_logs_insert_policy" ON public.exercise_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "exercise_logs_update_policy" ON public.exercise_logs;
CREATE POLICY "exercise_logs_update_policy" ON public.exercise_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "exercise_logs_delete_policy" ON public.exercise_logs;
CREATE POLICY "exercise_logs_delete_policy" ON public.exercise_logs FOR DELETE USING (auth.uid() = user_id);

-- RUNNING ACTIVITIES RLS
DROP POLICY IF EXISTS "running_select_policy" ON public.running_activities;
CREATE POLICY "running_select_policy" ON public.running_activities FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "running_insert_policy" ON public.running_activities;
CREATE POLICY "running_insert_policy" ON public.running_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "running_update_policy" ON public.running_activities;
CREATE POLICY "running_update_policy" ON public.running_activities FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "running_delete_policy" ON public.running_activities;
CREATE POLICY "running_delete_policy" ON public.running_activities FOR DELETE USING (auth.uid() = user_id);

-- DAILY PROGRESS RLS
DROP POLICY IF EXISTS "daily_progress_select_policy" ON public.daily_progress;
CREATE POLICY "daily_progress_select_policy" ON public.daily_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "daily_progress_insert_policy" ON public.daily_progress;
CREATE POLICY "daily_progress_insert_policy" ON public.daily_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "daily_progress_update_policy" ON public.daily_progress;
CREATE POLICY "daily_progress_update_policy" ON public.daily_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "daily_progress_delete_policy" ON public.daily_progress;
CREATE POLICY "daily_progress_delete_policy" ON public.daily_progress FOR DELETE USING (auth.uid() = user_id);

-- ACHIEVEMENTS RLS
DROP POLICY IF EXISTS "achievements_select_policy" ON public.achievements;
CREATE POLICY "achievements_select_policy" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "achievements_insert_policy" ON public.achievements;
CREATE POLICY "achievements_insert_policy" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "achievements_update_policy" ON public.achievements;
CREATE POLICY "achievements_update_policy" ON public.achievements FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "achievements_delete_policy" ON public.achievements;
CREATE POLICY "achievements_delete_policy" ON public.achievements FOR DELETE USING (auth.uid() = user_id);

-- USER XP RLS
DROP POLICY IF EXISTS "user_xp_select_policy" ON public.user_xp;
CREATE POLICY "user_xp_select_policy" ON public.user_xp FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_xp_insert_policy" ON public.user_xp;
CREATE POLICY "user_xp_insert_policy" ON public.user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_xp_update_policy" ON public.user_xp;
CREATE POLICY "user_xp_update_policy" ON public.user_xp FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_xp_delete_policy" ON public.user_xp;
CREATE POLICY "user_xp_delete_policy" ON public.user_xp FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 12. AUTOMATIC USER PROFILE & XP INITIALIZATION ON SIGNUP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Athlete'),
        NEW.email
    )
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_xp (user_id, xp, current_xp, level, current_level, fitness_score)
    VALUES (NEW.id, 2450, 2450, 8, 8, 78)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 13. STORAGE BUCKET FOR MEAL PHOTOS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-photos', 'meal-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "meal_photos_auth_upload" ON storage.objects;
CREATE POLICY "meal_photos_auth_upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'meal-photos' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "meal_photos_public_select" ON storage.objects;
CREATE POLICY "meal_photos_public_select" ON storage.objects
    FOR SELECT USING (bucket_id = 'meal-photos');

-- ============================================================================
-- 14. AUTO-CONFIRM UNCONFIRMED USERS (OPTIONAL UTILITY)
-- Run this if any user signup was blocked by email rate limits or unverified email:
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
-- ============================================================================

-- ============================================================================
-- 15. BODY GOALS & TRANSFORMATION LOGS WITH STRICT USER RLS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.body_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    goal_type TEXT NOT NULL DEFAULT 'transformation',
    fitness_level TEXT DEFAULT 'beginner',
    workout_location TEXT DEFAULT 'home',
    activity_level TEXT DEFAULT 'moderate',
    age INTEGER DEFAULT 21,
    gender TEXT DEFAULT 'male',
    starting_weight NUMERIC DEFAULT 70,
    current_weight NUMERIC DEFAULT 70,
    target_weight NUMERIC DEFAULT 68,
    height_cm NUMERIC DEFAULT 167,
    body_fat_pct NUMERIC DEFAULT 18,
    target_weeks INTEGER DEFAULT 12,
    diet_pref TEXT DEFAULT 'any',
    plan_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transformation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC,
    waist_cm NUMERIC,
    chest_cm NUMERIC,
    hips_cm NUMERIC,
    arms_cm NUMERIC,
    body_fat_pct NUMERIC,
    notes TEXT DEFAULT '',
    photo_url TEXT,
    habits_completed JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_body_goals_user ON public.body_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_trans_logs_user_date ON public.transformation_logs(user_id, log_date DESC);

-- Enable RLS
ALTER TABLE public.body_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformation_logs ENABLE ROW LEVEL SECURITY;

-- Strict User Isolation Policies
DROP POLICY IF EXISTS "body_goals_select" ON public.body_goals;
CREATE POLICY "body_goals_select" ON public.body_goals
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "body_goals_insert" ON public.body_goals;
CREATE POLICY "body_goals_insert" ON public.body_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "body_goals_update" ON public.body_goals;
CREATE POLICY "body_goals_update" ON public.body_goals
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "body_goals_delete" ON public.body_goals;
CREATE POLICY "body_goals_delete" ON public.body_goals
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "trans_logs_select" ON public.transformation_logs;
CREATE POLICY "trans_logs_select" ON public.transformation_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "trans_logs_insert" ON public.transformation_logs;
CREATE POLICY "trans_logs_insert" ON public.transformation_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "trans_logs_update" ON public.transformation_logs;
CREATE POLICY "trans_logs_update" ON public.transformation_logs
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "trans_logs_delete" ON public.transformation_logs;
CREATE POLICY "trans_logs_delete" ON public.transformation_logs
    FOR DELETE USING (auth.uid() = user_id);

