import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;
let _initialized = false;

export function getDb(): Client {
  if (!_client) {
    _client = createClient({
      url: (process.env.TURSO_DATABASE_URL || "file:support.db").trim(),
      authToken: (process.env.TURSO_AUTH_TOKEN || "").trim().replace(/\s+/g, ""),
    });
  }
  return _client;
}

export async function ensureDb(): Promise<Client> {
  const db = getDb();
  if (!_initialized) {
    await db.execute(`CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      os_type TEXT NOT NULL,
      os_version TEXT NOT NULL,
      computer_model TEXT NOT NULL,
      cpu TEXT NOT NULL,
      uses_rosetta INTEGER DEFAULT 0,
      plugin_name TEXT NOT NULL,
      daw_name TEXT,
      daw_version TEXT,
      issue_category TEXT NOT NULL,
      description TEXT NOT NULL,
      screenshot_urls TEXT,
      video_links TEXT,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'normal',
      assigned_to TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS support_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      author TEXT NOT NULL,
      author_type TEXT NOT NULL DEFAULT 'admin',
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (ticket_id) REFERENCES support_tickets(id)
    )`);
    _initialized = true;
  }
  return db;
}
