/**
 * Adaptateur base de données — SQLite (module natif node:sqlite, Node >= 22)
 *
 * Expose une API compatible avec `mysql2/promise` (pool.execute / pool.query)
 * afin que le reste du code (services) fonctionne sans modification :
 *   - SELECT  -> [ rows ]                 (rows = tableau d'objets)
 *   - INSERT  -> [ { insertId, affectedRows } ]
 *   - UPDATE  -> [ { affectedRows, changedRows } ]
 *   - DELETE  -> [ { affectedRows } ]
 *
 * Aucune installation externe : la base est un simple fichier local.
 */
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_FILE =
  process.env.DB_FILE || path.join(__dirname, '..', 'database', 'kickzone.db');

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// --- Schéma (créé automatiquement au premier démarrage) ----------------------
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'USER',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  summary      TEXT,
  content      TEXT,
  image_url    TEXT,
  category     TEXT NOT NULL DEFAULT 'ACTU',
  author       TEXT,
  views        INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pronostics (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  fixture_id   INTEGER,
  home_team    TEXT NOT NULL,
  away_team    TEXT NOT NULL,
  home_team_id INTEGER,
  away_team_id INTEGER,
  prediction   TEXT NOT NULL,
  score_home   INTEGER,
  score_away   INTEGER,
  result       TEXT NOT NULL DEFAULT 'EN_ATTENTE',
  confidence   INTEGER NOT NULL DEFAULT 50,
  league       TEXT,
  match_date   TEXT NOT NULL,
  user_id      INTEGER NOT NULL,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_articles_category  ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_pronos_match_date  ON pronostics(match_date);
CREATE INDEX IF NOT EXISTS idx_pronos_result      ON pronostics(result);
CREATE INDEX IF NOT EXISTS idx_pronos_user        ON pronostics(user_id);
`;
db.exec(SCHEMA);

// --- Normalisation des paramètres ------------------------------------------
// node:sqlite n'accepte que null / number / bigint / string / Buffer.
const toSqliteParam = (v) => {
  if (v === undefined || v === null) return null;
  if (v instanceof Date) {
    return isNaN(v.getTime())
      ? null
      : v.toISOString().slice(0, 19).replace('T', ' ');
  }
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number' || typeof v === 'bigint' || typeof v === 'string') return v;
  if (Buffer.isBuffer(v)) return v;
  return String(v);
};

// --- Traduction minimale de SQL MySQL -> SQLite ---------------------------
const translate = (sql) =>
  sql
    .replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP')
    .replace(/\bINSERT\s+IGNORE\b/gi, 'INSERT OR IGNORE');

const isRead = (sql) => /^\s*(SELECT|WITH|PRAGMA|EXPLAIN)/i.test(sql);

async function execute(sql, params = []) {
  const finalSql = translate(sql);
  const args = (Array.isArray(params) ? params : [params]).map(toSqliteParam);
  const stmt = db.prepare(finalSql);

  if (isRead(finalSql)) {
    const rows = stmt.all(...args);
    return [rows, undefined];
  }

  const info = stmt.run(...args);
  const result = {
    insertId: Number(info.lastInsertRowid) || 0,
    affectedRows: info.changes,
    changedRows: info.changes,
  };
  return [result, undefined];
}

module.exports = {
  execute,
  query: execute,
  raw: db,
  getConnection: async () => ({ release() {}, execute, query: execute }),
  end: async () => db.close(),
};

console.log(`[DB] SQLite prêt — ${DB_FILE}`);
