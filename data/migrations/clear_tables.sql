-- Clear all tables for a fresh import
-- Run this before re-importing data to avoid duplicates

-- Clear in reverse order of dependencies
TRUNCATE TABLE ff.draft_order CASCADE;
TRUNCATE TABLE ff.matchups CASCADE;
TRUNCATE TABLE ff.teams CASCADE;
TRUNCATE TABLE ff.owners CASCADE;

-- Reset sequences
ALTER SEQUENCE ff.teams_id_seq RESTART WITH 1;
ALTER SEQUENCE ff.matchups_id_seq RESTART WITH 1;
ALTER SEQUENCE ff.draft_order_id_seq RESTART WITH 1;