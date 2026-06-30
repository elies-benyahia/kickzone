require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function init() {
  const DB_NAME = process.env.DB_NAME || 'warzone_cdl';

  // Connexion sans base (pour pouvoir la créer si besoin)
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('[INIT] Connexion MySQL établie');

  // Création de la base si inexistante
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${DB_NAME}\``);
  console.log(`[INIT] Base de données "${DB_NAME}" prête`);

  // Suppression des tables dans l'ordre inverse des FK (idempotent)
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  await conn.query('DROP TABLE IF EXISTS pronostics');
  await conn.query('DROP TABLE IF EXISTS articles');
  await conn.query('DROP TABLE IF EXISTS users');
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('[INIT] Anciennes tables supprimées');

  // Création des tables depuis schema.sql
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conn.query(sql);
  console.log('[INIT] Tables créées avec succès');

  await conn.end();
  console.log('✅ Base de données initialisée');
}

init().catch(err => {
  console.error('[INIT] ❌ Erreur :', err.message);
  process.exit(1);
});
