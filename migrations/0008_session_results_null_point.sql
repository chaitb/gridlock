-- Migration number: 0008 	 2026-03-14T10:15:00.000Z
ALTER TABLE session_results DROP COLUMN points;
ALTER TABLE session_results ADD COLUMN points REAL;
