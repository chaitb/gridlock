-- Cumulative player scores per season/league
-- Per-race breakdowns live on the predictions table (score + breakdown columns)
CREATE TABLE player_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  season TEXT NOT NULL DEFAULT 'f1_2026',
  league TEXT NOT NULL DEFAULT 'global',
  total_score INTEGER NOT NULL DEFAULT 0,
  total_exact_matches INTEGER NOT NULL DEFAULT 0,
  races_scored INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES players(id),
  UNIQUE(user_id, season, league)
);

CREATE INDEX idx_player_scores_user ON player_scores(user_id);
CREATE INDEX idx_player_scores_season_league ON player_scores(season, league);
