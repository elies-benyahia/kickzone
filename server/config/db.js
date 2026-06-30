const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'warzone_cdl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

pool.getConnection()
  .then(conn => {
    console.log('[DB] Connexion MySQL établie');
    conn.release();
  })
  .catch(err => console.error('[DB] Erreur connexion MySQL :', err.message));

module.exports = pool;
