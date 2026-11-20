CREATE TABLE accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, site TEXT NOT NULL, review TEXT NOT NULL DEFAULT '', first_seen TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE signals (account_id TEXT NOT NULL REFERENCES accounts(id), source_url TEXT NOT NULL, event_key TEXT NOT NULL, payload TEXT NOT NULL, origin TEXT NOT NULL, PRIMARY KEY(account_id,source_url));
--> statement-breakpoint
CREATE TABLE contacts (account_id TEXT NOT NULL REFERENCES accounts(id), identity TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(account_id,identity));
--> statement-breakpoint
CREATE TABLE runs (id TEXT PRIMARY KEY, action_key TEXT NOT NULL, query TEXT NOT NULL, status TEXT NOT NULL, message TEXT NOT NULL, created TEXT NOT NULL, finished TEXT);
--> statement-breakpoint
CREATE INDEX runs_by_action ON runs(action_key,finished);
--> statement-breakpoint
CREATE TABLE leases (action_key TEXT PRIMARY KEY, run_id TEXT NOT NULL, expires TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE settings (id TEXT PRIMARY KEY, value TEXT NOT NULL);
