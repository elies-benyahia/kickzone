// database/init.js — remet la base à zéro ("npm run db:reset").
// Supprime le fichier SQLite ; le schéma est recréé au chargement de config/db.js.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '..');
const DB_FILE = process.env.DB_FILE
  ? path.resolve(SERVER_DIR, process.env.DB_FILE)
  : path.join(SERVER_DIR, 'database', 'kickzone.db');

// SQLite crée 3 fichiers : la base + 2 temporaires (-wal, -shm).
for (const suffix of ['', '-wal', '-shm']) {
  const f = DB_FILE + suffix;
  if (fs.existsSync(f)) { fs.rmSync(f); console.log(`[INIT] Supprimé : ${path.basename(f)}`); }
}

require('../config/db'); // recrée le fichier + les tables
console.log('✅ Base de données initialisée');
process.exit(0);
