// database/seed.js — remplit la base : admin, articles, pronostics.
// Lancé par "npm run db:reset" (main) ou au démarrage si la base est vide (seedIfEmpty).
// Les données (articles, matchs de démo) sont dans seedData.js.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const axios  = require('axios');
const pool   = require('../config/db');
const { TRANSFER_IMAGES, demoFixtures, EDITORIAL } = require('./seedData');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Titre -> slug d'URL (comme dans articleService).
const slugify = (str) =>
  str.toLowerCase()
     .normalize('NFD').replace(/[̀-ͯ]/g, '')
     .replace(/[^a-z0-9\s-]/g, '')
     .trim().replace(/\s+/g, '-').replace(/-+/g, '-')
     .substring(0, 80);

// ─── 1. Admin ────────────────────────────────────────────────────────────────
async function createAdmin() {
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin2024!', 12);
  const email = process.env.ADMIN_EMAIL || 'admin@kickzone.fr';
  // OR IGNORE : ne fait rien si l'admin existe déjà (email unique).
  await pool.execute('INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)', [email, hash, 'ADMIN']);
  const [[admin]] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  console.log('[SEED] ✅ Admin créé');
  return admin.id;
}

// ─── 2. Matchs à venir (vrais via l'API, sinon démo) ────────────────────────
const IMPORTANT_LEAGUES = new Set([2, 3, 39, 61, 78, 135, 140]); // UCL, UEL, PL, L1, Bundesliga, Serie A, Liga

async function getUpcomingFixtures() {
  const API_KEY = process.env.FOOTBALL_API_KEY;
  if (!API_KEY) {
    console.log('[SEED] ⚠️  FOOTBALL_API_KEY manquant — matchs de démonstration utilisés');
    return demoFixtures();
  }

  // Prochains jours, ligues majeures uniquement.
  const fixtures = [];
  for (let i = 0; i <= 6 && fixtures.length < 8; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    try {
      const { data } = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params: { date: d.toISOString().split('T')[0] },
        headers: { 'x-apisports-key': API_KEY },
        timeout: 12000,
      });
      fixtures.push(...(data.response ?? []).filter((f) => IMPORTANT_LEAGUES.has(f.league.id)));
    } catch { break; }
    await sleep(300);
  }
  console.log(`[SEED] ✅ ${fixtures.length} matchs trouvés`);
  return fixtures.length ? fixtures.slice(0, 8) : demoFixtures();
}

// ─── 3. Pronostics (1 par match) ───────────────────────────────────────────
const PREDICTIONS = [
  (h) => `Victoire ${h} avec au moins un but d'écart`,
  () => `Match nul 1-1, les deux équipes prudentes`,
  (_, a) => `Victoire surprise de ${a} grâce à la contre-attaque`,
  (h) => `Victoire ${h} 2-0, clean sheet`,
  () => `Match ouvert, les deux équipes marquent`,
];

async function createPronostics(fixtures, adminId) {
  await pool.execute('DELETE FROM pronostics');
  if (fixtures.length === 0) { console.log('[SEED] ⚠️  Aucun match, pronos ignorés'); return; }

  for (const f of fixtures) {
    const { home, away } = f.teams;
    const pred = PREDICTIONS[(home.id + away.id) % PREDICTIONS.length];
    await pool.execute(
      `INSERT INTO pronostics (fixture_id, home_team, away_team, home_team_id, away_team_id,
        prediction, confidence, league, match_date, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [f.fixture.id, home.name, away.name, home.id, away.id,
       pred(home.name, away.name), 55 + ((home.id + away.id) % 30),
       f.league.name, new Date(f.fixture.date), adminId]
    );
  }
  console.log(`[SEED] ✅ ${fixtures.length} pronostics créés`);
}

// ─── 4. Articles "transfert" depuis l'API Football (si clé présente) ────────
const transferImage = (playerId, teamId) => TRANSFER_IMAGES[(playerId + teamId) % TRANSFER_IMAGES.length];

async function createTransferArticles() {
  const API_KEY = process.env.FOOTBALL_API_KEY;
  if (!API_KEY) return;

  for (const teamId of [85, 50, 541, 40, 529]) { // PSG, Man City, Real, Liverpool, Barça
    try {
      const { data } = await axios.get('https://v3.football.api-sports.io/transfers', {
        params: { team: teamId },
        headers: { 'x-apisports-key': API_KEY },
        timeout: 12000,
      });
      const recent = (data.response ?? [])
        .filter((t) => new Date(t.transfers?.[0]?.date).getFullYear() >= 2026)
        .slice(0, 3);

      for (const t of recent) {
        const tr = t.transfers[0], p = t.player;
        const fee = tr.fee || 'Montant non divulgué';
        const type = tr.type?.toLowerCase().includes('loan') ? 'Prêt'
                   : tr.type?.toLowerCase().includes('free') ? 'Libre' : 'Définitif';
        const toTeam = tr.teams?.in?.name ?? 'Club inconnu';
        const fromTeam = tr.teams?.out?.name ?? 'Club inconnu';
        const title = `${type === 'Prêt' ? 'PRÊT' : 'OFFICIEL'} : ${p.name} rejoint ${toTeam}`;
        const slug = slugify(title) + '-' + (tr.date ?? Date.now());

        await pool.execute(
          `INSERT INTO articles (slug, title, summary, content, image_url, category, author, published_at)
           VALUES (?, ?, ?, ?, ?, 'TRANSFERT', 'Rédaction KickZone', ?)
           ON CONFLICT(slug) DO UPDATE SET
             title = excluded.title, summary = excluded.summary,
             content = excluded.content, image_url = excluded.image_url`,
          [
            slug, title,
            `${p.name} quitte ${fromTeam} pour rejoindre ${toTeam}. Type : ${type}. Montant : ${fee}.`,
            `<p><strong>${p.name}</strong> a rejoint <strong>${toTeam}</strong> en provenance de <strong>${fromTeam}</strong>.</p><p>Type : <strong>${type}</strong>. Montant : <strong>${fee}</strong>.</p>`,
            transferImage(p.id ?? 0, tr.teams?.in?.id ?? 0),
            new Date(tr.date),
          ]
        );
      }
      await sleep(400);
    } catch (e) {
      console.log(`  ⚠️  Erreur team ${teamId} :`, e.message);
    }
  }
  console.log('[SEED] ✅ Articles transferts créés');
}

// ─── 5. Articles de la rédaction (données dans seedData.js) ────────────────
async function createEditorialArticles() {
  for (const a of EDITORIAL) {
    await pool.execute(
      `INSERT INTO articles (slug, title, summary, content, image_url, category, author, published_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Rédaction KickZone', ?)
       ON CONFLICT(slug) DO UPDATE SET
         title = excluded.title, summary = excluded.summary,
         content = excluded.content, image_url = excluded.image_url`,
      [a.slug, a.title, a.summary, a.content ?? null, a.imageUrl, a.category, a.date]
    );
  }
  console.log('[SEED] ✅ Articles éditoriaux créés');
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
// closePool=false quand le serveur appelle le seed au démarrage (il continue de tourner).
async function main({ closePool = true } = {}) {
  console.log('🌱 Démarrage seed KickZone...');
  const adminId = await createAdmin();
  await createEditorialArticles();
  await createPronostics(await getUpcomingFixtures(), adminId);
  await createTransferArticles();

  const [[{ a }]] = await pool.execute('SELECT COUNT(*) AS a FROM articles');
  const [[{ p }]] = await pool.execute('SELECT COUNT(*) AS p FROM pronostics');
  console.log(`✅ SEED TERMINÉ — ${a} articles, ${p} pronostics`);

  if (closePool) await pool.end();
}

// Remplit la base seulement si elle est vide (appelée par index.js au démarrage).
async function seedIfEmpty() {
  try {
    const [[{ n }]] = await pool.execute('SELECT COUNT(*) AS n FROM articles');
    if (n > 0) return;
    console.log('[SEED] Base vide détectée — seed automatique...');
    await main({ closePool: false });
  } catch (e) {
    console.error('[SEED] seedIfEmpty échoué :', e.message);
  }
}

module.exports = { main, seedIfEmpty };

// Vrai seulement si lancé directement (node database/seed.js), pas si importé.
if (require.main === module) {
  main().catch((e) => { console.error('[SEED] ❌', e.message); process.exit(1); });
}
