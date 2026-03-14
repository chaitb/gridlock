-- Migration number: 0007 	 2026-03-14T09:33:52.923Z
CREATE TABLE IF NOT EXISTS session_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_key INTEGER NOT NULL,
  meeting_key INTEGER NOT NULL,
  driver_number INTEGER NOT NULL,
  position INTEGER,
  number_of_laps INTEGER NOT NULL,
  points REAL NOT NULL,
  dnf INTEGER NOT NULL DEFAULT 0,
  dns INTEGER NOT NULL DEFAULT 0,
  dsq INTEGER NOT NULL DEFAULT 0,
  starting_position INTEGER,
  duration TEXT,
  gap_to_leader TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_key, driver_number)
);

CREATE INDEX IF NOT EXISTS idx_session_results_session_key ON session_results(session_key);
