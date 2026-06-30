require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const IMAGES = [
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
  'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
  'https://images.unsplash.com/photo-1542385151-efd9000785fd?w=800&q=80',
  'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80',
  'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&q=80',
];

async function run() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'warzone_cdl',
  });

  // Récupère tous les articles avec image API-Sports ou sans image
  const [articles] = await conn.query(
    "SELECT id FROM articles WHERE image_url LIKE '%media.api-sports.io/football/players/%' OR image_url IS NULL OR image_url = ''"
  );

  console.log(`${articles.length} articles à corriger`);

  for (const art of articles) {
    const img = IMAGES[art.id % IMAGES.length];
    await conn.execute('UPDATE articles SET image_url = ? WHERE id = ?', [img, art.id]);
  }

  console.log(`✅ ${articles.length} images mises à jour`);
  await conn.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
