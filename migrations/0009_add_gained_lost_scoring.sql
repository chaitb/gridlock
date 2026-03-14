-- Add gained_lost column to session_results for storing positions gained/lost from Notion
ALTER TABLE session_results ADD COLUMN gained_lost INTEGER;

-- Add scoring columns to predictions table (per-race results)
ALTER TABLE predictions ADD COLUMN score INTEGER;
ALTER TABLE predictions ADD COLUMN exact_matches INTEGER;
ALTER TABLE predictions ADD COLUMN breakdown TEXT;
