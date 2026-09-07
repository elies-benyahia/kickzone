// ============================================================================
//  config/db.js — accès à la base de données
//  La base est un simple fichier SQLite (aucun serveur MySQL à installer).
//  On utilise `node:sqlite`, le module SQLite intégré à Node 22+.
//
//  Ce fichier expose une fonction `execute(sql, params)` compatible avec la
//  librairie mysql2 : les services peuvent écrire du SQL normal et récupérer
//  les résultats sous la forme `[lignes]` ou `[{ insertId, affectedRows }]`.
// ============================================================================

const path = require('path');                       // construction de chemins
const fs = require('fs');                            // création du dossier de la base
const { DatabaseSync } = require('node:sqlite');     // moteur SQLite intégré à Node

// Emplacement du fichier de base de données.
// DB_FILE (dans .env) peut être relatif : on le résout par rapport au dossier
// server/ pour obtenir toujours le même fichier, peu importe d'où node est lancé.
const SERVER_DIR = path.join(__dirname, '..');
const DB_FILE = process.env.DB_FILE
  ? path.resolve(SERVER_DIR, process.env.DB_FILE)
  : path.join(SERVER_DIR, 'database', 'kickzone.db');

// Crée le dossier de la base s'il n'existe pas encore.
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

// Ouvre (ou crée) le fichier de base de données.
const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA journal_mode = WAL');   // mode d'écriture plus rapide et plus sûr
db.exec('PRAGMA foreign_keys = ON');    // active le respect des clés étrangères

// --- Schéma : 3 tables, créées au premier démarrage si elles n'existent pas ---
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,  -- identifiant unique auto-incrémenté
  username   TEXT,                               -- pseudo (facultatif)
  email      TEXT NOT NULL UNIQUE,               -- sert d'identifiant de connexion
  password   TEXT NOT NULL,                      -- mot de passe HACHÉ (bcrypt), jamais en clair
  role       TEXT NOT NULL DEFAULT 'USER',       -- 'USER' ou 'ADMIN'
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,             -- version "URL" du titre (ex: officiel-gordon-barcelone)
  title        TEXT NOT NULL,
  summary      TEXT,                             -- chapô / résumé
  content      TEXT,                             -- corps de l'article en HTML
  image_url    TEXT,
  category     TEXT NOT NULL DEFAULT 'ACTU',     -- TRANSFERT / ACTU / ANALYSE / INTERVIEW / RESULTATS
  author       TEXT,
  views        INTEGER NOT NULL DEFAULT 0,       -- nombre de lectures
  published_at TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pronostics (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  fixture_id   INTEGER,                          -- id du match dans l'API-Football (facultatif)
  home_team    TEXT NOT NULL,
  away_team    TEXT NOT NULL,
  home_team_id INTEGER,
  away_team_id INTEGER,
  prediction   TEXT NOT NULL,                    -- le pronostic écrit par l'utilisateur
  score_home   INTEGER,
  score_away   INTEGER,
  result       TEXT NOT NULL DEFAULT 'EN_ATTENTE', -- CORRECT / RATE / EN_ATTENTE
  confidence   INTEGER NOT NULL DEFAULT 50,      -- indice de confiance en %
  league       TEXT,
  match_date   TEXT NOT NULL,
  user_id      INTEGER NOT NULL,                 -- auteur du pronostic
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Clé étrangère : un pronostic appartient à un utilisateur.
  -- Si l'utilisateur est supprimé, ses pronostics le sont aussi (CASCADE).
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index : accélèrent les recherches fréquentes (par catégorie, par date...).
CREATE INDEX IF NOT EXISTS idx_articles_category  ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_pronos_match_date  ON pronostics(match_date);
CREATE INDEX IF NOT EXISTS idx_pronos_result      ON pronostics(result);
CREATE INDEX IF NOT EXISTS idx_pronos_user        ON pronostics(user_id);
`;
db.exec(SCHEMA);

// --- Conversion des paramètres avant l'envoi à SQLite ---------------------
// node:sqlite n'accepte que null / nombre / chaîne / Buffer.
// On convertit donc les types que les services peuvent passer.
const toSqliteParam = (v) => {
  if (v === undefined || v === null) return null;                 // undefined -> NULL
  if (v instanceof Date) {                                        // Date -> "YYYY-MM-DD HH:MM:SS"
    return isNaN(v.getTime()) ? null : v.toISOString().slice(0, 19).replace('T', ' ');
  }
  if (typeof v === 'boolean') return v ? 1 : 0;                   // booléen -> 1 / 0
  if (typeof v === 'number' || typeof v === 'bigint' || typeof v === 'string') return v;
  if (Buffer.isBuffer(v)) return v;
  return String(v);                                               // tout le reste -> texte
};

// Petites différences de syntaxe entre MySQL et SQLite, corrigées à la volée.
const translate = (sql) =>
  sql
    .replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP')
    .replace(/\bINSERT\s+IGNORE\b/gi, 'INSERT OR IGNORE');

// Une requête est-elle une lecture (SELECT...) ou une écriture (INSERT/UPDATE/DELETE) ?
const isRead = (sql) => /^\s*(SELECT|WITH|PRAGMA|EXPLAIN)/i.test(sql);

// Exécute une requête SQL avec ses paramètres (?, ?, ...).
async function execute(sql, params = []) {
  const finalSql = translate(sql);
  const args = (Array.isArray(params) ? params : [params]).map(toSqliteParam);
  const stmt = db.prepare(finalSql); // requête préparée = protection contre l'injection SQL

  if (isRead(finalSql)) {
    // Lecture : on renvoie [tableau de lignes] (comme mysql2)
    return [stmt.all(...args), undefined];
  }

  // Écriture : on renvoie [{ insertId, affectedRows }]
  const info = stmt.run(...args);
  return [{
    insertId: Number(info.lastInsertRowid) || 0, // id de la ligne insérée
    affectedRows: info.changes,                  // nombre de lignes modifiées
    changedRows: info.changes,
  }, undefined];
}

// API exposée aux services. `execute` et `query` sont identiques (compat mysql2).
module.exports = {
  execute,
  query: execute,
  raw: db,
  getConnection: async () => ({ release() {}, execute, query: execute }),
  end: async () => db.close(),
};

console.log(`[DB] SQLite prêt — ${DB_FILE}`);
