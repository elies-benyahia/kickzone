require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'warzone_cdl',
  });

  const run = async (label, sql) => {
    try { await conn.query(sql); console.log(`✅ ${label}`); }
    catch (e) { console.log(`⚠️  ${label}: ${e.message}`); }
  };

  await run('username colonne', 'ALTER TABLE users ADD COLUMN username VARCHAR(100)');
  await run('role default USER', "ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER'");
  await run('score_home', 'ALTER TABLE pronostics ADD COLUMN score_home INT');
  await run('score_away', 'ALTER TABLE pronostics ADD COLUMN score_away INT');

  await conn.end();
  console.log('Migration terminée.');
}
migrate().catch(e => { console.error(e.message); process.exit(1); });
