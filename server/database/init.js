/**
 * Initialisation de la base de données (SQLite).
 * Supprime l'ancien fichier puis recrée le schéma via config/db.js.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '..');
const DB_FILE = process.env.DB_FILE
  ? path.resolve(SERVER_DIR, process.env.DB_FILE)
  : path.join(SERVER_DIR, 'database', 'kickzone.db');

for (const suffix of ['', '-wal', '-shm']) {
  const f = DB_FILE + suffix;
  if (fs.existsSync(f)) {
    fs.rmSync(f);
    console.log(`[INIT] Supprimé : ${path.basename(f)}`);
  }
}

// Le simple fait de charger config/db.js recrée le fichier et le schéma.
require('../config/db');

console.log('✅ Base de données initialisée');
process.exit(0);
