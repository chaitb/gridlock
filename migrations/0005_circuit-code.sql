-- Migration number: 0005
ALTER TABLE predictions RENAME COLUMN race_code TO circuit_code;
