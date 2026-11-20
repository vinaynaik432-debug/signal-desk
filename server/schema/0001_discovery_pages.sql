CREATE TABLE run_pages (
  run_id TEXT PRIMARY KEY REFERENCES runs(id),
  decisions TEXT NOT NULL
);
