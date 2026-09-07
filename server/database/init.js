// ============================================================================
//  database/init.js — remet la base de données à zéro
//  Lancé par "npm run db:reset". Supprime le fichier SQLite existant ;
//  le schéma est ensuite recréé automatiquement au chargement de config/db.js.
// ============================================================================

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');

// Même calcul de chemin que dans config/db.js (relatif au dossier server/).
const SERVER_DIR = path.join(__dirname, '..');
const DB_FILE = process.env.DB_FILE
  ? path.resolve(SERVER_DIR, process.env.DB_FILE)
  : path.join(SERVER_DIR, 'database', 'kickzone.db');

// SQLite crée 3 fichiers : la base, et 2 fichiers temporaires (-wal, -shm).
for (const suffix of ['', '-wal', '-shm']) {
  const f = DB_FILE + suffix;
  if (fs.existsSync(f)) {
    fs.rmSync(f);
    console.log(`[INIT] Supprimé : ${path.basename(f)}`);
  }
}

// Charger config/db.js recrée le fichier vide + toutes les tables (voir SCHEMA).
require('../config/db');

console.log('✅ Base de données initialisée');
process.exit(0);
