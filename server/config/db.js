// config/db.js — la base de données.
// C'est un simple fichier SQLite (aucun serveur à installer), lu via le module
// natif de Node. On expose une fonction execute(sql, params) qui renvoie :
//   - SELECT           -> [ lignes ]
//   - INSERT/UPDATE/... -> [ { insertId, affectedRows } ]

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

// Chemin du fichier de base (DB_FILE dans .env, sinon server/database/kickzone.db).
const SERVER_DIR = path.join(__dirname, '..');
const DB_FILE = process.env.DB_FILE
  ? path.resolve(SERVER_DIR, process.env.DB_FILE)
  : path.join(SERVER_DIR, 'database', 'kickzone.db');

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA foreign_keys = ON'); // fait respecter les clés étrangères

// Schéma : 3 tables, créées au premier démarrage si besoin.
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT,
  email      TEXT NOT NULL UNIQUE,          -- identifiant de connexion
  password   TEXT NOT NULL,                 -- haché avec bcrypt (jamais en clair)
  role       TEXT NOT NULL DEFAULT 'USER',  -- 'USER' ou 'ADMIN'
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,        -- version URL du titre
  title        TEXT NOT NULL,
  summary      TEXT,
  content      TEXT,                        -- corps de l'article (HTML)
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
  result       TEXT NOT NULL DEFAULT 'EN_ATTENTE', -- CORRECT / RATE / EN_ATTENTE
  confidence   INTEGER NOT NULL DEFAULT 50,
  league       TEXT,
  match_date   TEXT NOT NULL,
  user_id      INTEGER NOT NULL,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- prono lié à un utilisateur
);

CREATE INDEX IF NOT EXISTS idx_articles_category  ON articles(category);
CREATE INDEX IF NOT EXISTS idx_pronos_match_date  ON pronostics(match_date);
CREATE INDEX IF NOT EXISTS idx_pronos_user        ON pronostics(user_id);
`);

// SQLite n'accepte que null / nombre / texte : on convertit Date, booléen, undefined.
const toParam = (v) => {
  if (v == null) return null;
  if (v instanceof Date) return isNaN(v) ? null : v.toISOString().slice(0, 19).replace('T', ' ');
  if (typeof v === 'boolean') return v ? 1 : 0;
  return v;
};

// Exécute une requête SQL paramétrée (protège contre l'injection SQL).
async function execute(sql, params = []) {
  const stmt = db.prepare(sql);
  const args = (Array.isArray(params) ? params : [params]).map(toParam);

  if (/^\s*(SELECT|WITH|PRAGMA)/i.test(sql)) {
    return [stmt.all(...args)];                       // lecture -> [lignes]
  }
  const info = stmt.run(...args);                     // écriture
  return [{ insertId: Number(info.lastInsertRowid) || 0, affectedRows: info.changes }];
}

module.exports = { execute, end: async () => db.close() };
console.log(`[DB] SQLite prêt — ${DB_FILE}`);
