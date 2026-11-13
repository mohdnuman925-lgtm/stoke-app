-- ============================================================================
-- STOKE FITNESS APP — DATABASE PERFORMANCE & SCALING OPTIMIZATION MIGRATION
-- Migration Version: 20261013_performance_indexes_v1.sql
-- Target: Supabase / PostgreSQL 15+
--
-- PURPOSE:
-- Fix database performance bottlenecks and prepare the database to handle
-- 10× traffic growth without changing infrastructure.
--
-- SAFE & IDEMPOTENT:
-- 1. All index creations use IF NOT EXISTS.
-- 2. Never deletes existing production user data.
-- 3. Does not alter column schemas, types, or table structures.
-- 4. Eliminates sequential scans on joins and foreign keys.
-- 5. Eliminates expensive in-memory sorts on frequently filtered queries.
-- 6. Drops redundant duplicate indexes to minimize write amplification.
-- ============================================================================

-- ============================================================================
-- 1. FOREIGN KEY & JOIN OPTIMIZATION: EXERCISE LOGS
-- ============================================================================
-- Problem: exercise_logs has a foreign key `workout_id REFERENCES workouts(id)`.
-- Query: workouts joined with exercise_logs:
--   SELECT * FROM workouts w JOIN exercise_logs e ON e.workout_id = w.id;
-- Prior state: Only idx_exercise_logs_user(user_id) existed. Every join or
-- cascade delete required a FULL TABLE SEQUENTIAL SCAN of exercise_logs!
-- Fix: Index workout_id and covering composite (workout_id, user_id).
CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout_id 
    ON public.exercise_logs(workout_id);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout_user 
    ON public.exercise_logs(workout_id, user_id);

COMMENT ON INDEX public.idx_exercise_logs_workout_id IS 
    'Optimizes FK joins and cascade deletions between workouts and exercise_logs';

-- ============================================================================
-- 2. SORT ELIMINATION: RUNNING ACTIVITIES
-- ============================================================================
-- Problem: App frequently queries:
--   SELECT * FROM running_activities WHERE user_id = $1 ORDER BY created_at DESC;
-- Prior state: Only idx_running_user_date(user_id, activity_date) existed.
-- Because created_at was unindexed, PostgreSQL performed an in-memory Quicksort
-- on every run retrieval. At 10x traffic with GPS coordinates, this exhausts
-- database RAM and spikes CPU.
-- Fix: Composite index matching exact filter + order direction.
CREATE INDEX IF NOT EXISTS idx_running_user_created 
    ON public.running_activities(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_running_user_date_created 
    ON public.running_activities(user_id, activity_date DESC, created_at DESC);

COMMENT ON INDEX public.idx_running_user_created IS 
    'Eliminates in-memory quicksort when fetching recent running history';

-- ============================================================================
-- 3. COMPOSITE INDEXES: MEALS & NUTRITION TRACKING
-- ============================================================================
-- Problem: App queries:
--   SELECT * FROM meals WHERE user_id = $1 AND meal_date = $2 ORDER BY created_at ASC;
-- Prior state: idx_meals_user_date(user_id, meal_date) existed, requiring a
-- secondary sort on created_at.
-- Fix: Composite index covering filter and chronological display sort.
CREATE INDEX IF NOT EXISTS idx_meals_user_date_created 
    ON public.meals(user_id, meal_date, created_at ASC);

COMMENT ON INDEX public.idx_meals_user_date_created IS 
    'Index-only traversal for daily meal timeline with chronological ordering';

-- ============================================================================
-- 4. COMPOSITE INDEXES: WORKOUT SESSIONS
-- ============================================================================
-- Problem: App queries:
--   SELECT * FROM workouts WHERE user_id = $1 AND workout_date = $2 ORDER BY created_at ASC;
-- Fix: Composite index for daily workout retrieval and date-range history.
CREATE INDEX IF NOT EXISTS idx_workouts_user_date_created 
    ON public.workouts(user_id, workout_date, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_workouts_user_history 
    ON public.workouts(user_id, workout_date DESC);

COMMENT ON INDEX public.idx_workouts_user_date_created IS 
    'Optimizes daily workout lookup and historical date range scans';

-- ============================================================================
-- 5. REMOVE REDUNDANT DUPLICATE INDEXES (WRITE OVERHEAD REDUCTION)
-- ============================================================================
-- Problem:
-- 1. public.daily_progress has a table constraint:
--      CONSTRAINT unique_user_date UNIQUE (user_id, date)
--    PostgreSQL automatically builds a unique btree index for this constraint.
--    The manually created `idx_daily_progress_user_date ON public.daily_progress(user_id, date)`
--    is a 100% duplicate index, doubling B-Tree maintenance cost on every insert/upsert!
-- 2. public.user_xp has:
--      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE
--    PostgreSQL automatically creates a unique index on user_id.
--    The manually created `idx_user_xp_user ON public.user_xp(user_id)` is a duplicate.
-- Fix: Drop duplicate non-unique indexes, keeping the primary/unique constraint indexes intact.

DROP INDEX IF EXISTS public.idx_daily_progress_user_date;
DROP INDEX IF EXISTS public.idx_user_xp_user;

-- ============================================================================
-- 6. VERIFICATION & EXPLAIN ANALYZE BENCHMARK TEMPLATES
-- ============================================================================
-- Run these queries in Supabase SQL Editor to verify index utilization:
--
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM public.exercise_logs
-- WHERE workout_id = '00000000-0000-0000-0000-000000000000'
--   AND user_id = '00000000-0000-0000-0000-000000000000';
-- Expected: Bitmap Index Scan or Index Scan on idx_exercise_logs_workout_user (Cost: 0.15..8.17, Rows: 0..10)
--
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM public.running_activities
-- WHERE user_id = '00000000-0000-0000-0000-000000000000'
-- ORDER BY created_at DESC
-- LIMIT 20;
-- Expected: Index Scan using idx_running_user_created (No sort node in query plan)
--
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM public.meals
-- WHERE user_id = '00000000-0000-0000-0000-000000000000'
--   AND meal_date = CURRENT_DATE
-- ORDER BY created_at ASC;
-- Expected: Index Scan using idx_meals_user_date_created (No sort node)
-- ============================================================================
