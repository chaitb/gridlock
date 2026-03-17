-- Migration number: 0011 	 2026-03-17T06:11:52.393Z

ALTER TABLE players ADD COLUMN full_name TEXT;
ALTER TABLE players ADD COLUMN flair TEXT;
