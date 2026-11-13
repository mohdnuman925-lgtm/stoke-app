-- ============================================================================
-- STOKE FITNESS APP — PERFORMANCE INDEXES ROLLBACK MIGRATION
-- Rollback Version: 20261013_performance_indexes_rollback_v1.sql
-- Target: Supabase / PostgreSQL 15+
--
-- PURPOSE:
-- Safely revert index changes applied in supabase_performance_migration.sql
-- without impacting user data or schema constraints.
-- ============================================================================

-- 1. Drop added performance indexes
DROP INDEX IF EXISTS public.idx_exercise_logs_workout_user;
DROP INDEX IF EXISTS public.idx_exercise_logs_workout_id;
DROP INDEX IF EXISTS public.idx_running_user_date_created;
DROP INDEX IF EXISTS public.idx_running_user_created;
DROP INDEX IF EXISTS public.idx_meals_user_date_created;
DROP INDEX IF EXISTS public.idx_workouts_user_history;
DROP INDEX IF EXISTS public.idx_workouts_user_date_created;

-- 2. Restore duplicate indexes if strict baseline compatibility is required
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON public.daily_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_xp_user ON public.user_xp(user_id);
