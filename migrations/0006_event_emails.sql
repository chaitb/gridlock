-- Migration number: 0006 	 2026-03-11T19:32:30.859Z
CREATE TABLE IF NOT EXISTS event_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT NOT NULL,
  type TEXT NOT NULL,
  sent INTEGER NOT NULL DEFAULT 0,
  race TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_emails_event_race ON event_emails(event, race);
