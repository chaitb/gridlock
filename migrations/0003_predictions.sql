-- Migration number: 0003 	 2026-03-06T10:32:20.869Z
CREATE TABLE IF NOT EXISTS predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  race_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  prediction TEXT,
  FOREIGN KEY (user_id) REFERENCES players(id),
  UNIQUE(user_id, race_code)
);
