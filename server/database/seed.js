require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const axios  = require('axios');

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'warzone_cdl',
  waitForConnections: true,
  connectionLimit: 5,
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const slugify = (str) =>
  str.toLowerCase()
     .normalize('NFD').replace(/[̀-ͯ]/g, '')
     .replace(/[^a-z0-9\s-]/g, '')
     .trim()
     .replace(/\s+/g, '-')
     .replace(/-+/g, '-')
     .substring(0, 80);

// ─── 1. Admin ─────────────────────────────────────────────────────────────────
async function createAdmin() {
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin2024!', 12);
  await pool.execute(
    'INSERT IGNORE INTO users (email, password, role) VALUES (?, ?, ?)',
    [process.env.ADMIN_EMAIL || 'admin@kickzone.fr', hash, 'ADMIN']
  );
  const [[admin]] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [
    process.env.ADMIN_EMAIL || 'admin@kickzone.fr',
  ]);
  console.log('[SEED] ✅ Admin créé');
  return admin.id;
}

// ─── 2. Vrais matchs API Football ─────────────────────────────────────────────
async function getUpcomingFixtures() {
  const API_KEY = process.env.FOOTBALL_API_KEY;
  if (!API_KEY) { console.log('[SEED] ⚠️  FOOTBALL_API_KEY manquant'); return []; }

  const IMPORTANT_LEAGUES = new Set([1, 2, 3, 39, 61, 140, 78, 135]);

  try {
    // Priorité : Coupe du Monde 2026
    const { data: wc } = await axios.get('https://v3.football.api-sports.io/fixtures', {
      params: { league: 1, season: 2026, next: 10 },
      headers: { 'x-apisports-key': API_KEY },
      timeout: 12000,
    });
    if (wc.response?.length >= 4) {
      console.log(`[SEED] ✅ ${wc.response.length} matchs CdM trouvés`);
      return wc.response.slice(0, 8);
    }
  } catch (e) { console.log('[SEED] API WC indisponible :', e.message); }

  // Fallback : prochains jours, ligues majeures
  const fixtures = [];
  for (let i = 0; i <= 4 && fixtures.length < 8; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    const date = d.toISOString().split('T')[0];
    try {
      const { data } = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params: { date },
        headers: { 'x-apisports-key': API_KEY },
        timeout: 12000,
      });
      fixtures.push(...(data.response ?? []).filter(f => IMPORTANT_LEAGUES.has(f.league.id)));
    } catch { break; }
    await sleep(300);
  }

  console.log(`[SEED] ✅ ${fixtures.length} matchs trouvés`);
  return fixtures.slice(0, 8);
}

// ─── 3. Pronostics ────────────────────────────────────────────────────────────
async function createPronostics(fixtures, adminId) {
  await pool.execute('DELETE FROM pronostics');

  if (fixtures.length === 0) { console.log('[SEED] ⚠️  Aucun match, pronos ignorés'); return; }

  const PREDICTIONS = [
    (h) => `Victoire ${h} avec au moins un but d'écart`,
    (h, a) => `Match nul 1-1, les deux équipes prudentes`,
    (_, a) => `Victoire surprise de ${a} grâce à la contre-attaque`,
    (h) => `Victoire ${h} 2-0, clean sheet`,
    (h, a) => `Match ouvert, les deux équipes marquent`,
  ];

  for (const f of fixtures) {
    const home = f.teams.home;
    const away = f.teams.away;
    const pred = PREDICTIONS[(home.id + away.id) % PREDICTIONS.length];

    await pool.execute(
      `INSERT INTO pronostics
         (fixture_id, home_team, away_team, home_team_id, away_team_id,
          prediction, confidence, league, match_date, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        f.fixture.id,
        home.name,
        away.name,
        home.id,
        away.id,
        pred(home.name, away.name),
        55 + ((home.id + away.id) % 30),
        f.league.name,
        new Date(f.fixture.date),
        adminId,
      ]
    );
    console.log(`  ✅ Prono: ${home.name} vs ${away.name} (${f.league.name})`);
  }
  console.log(`[SEED] ✅ ${fixtures.length} pronostics créés`);
}

// Images Unsplash publiques pour les articles transferts (rotatives, accessibles sans auth)
const TRANSFER_IMAGES = [
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80', // joueur en action
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', // match de foot
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80', // stade vue aérienne
  'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80',    // chaussures de foot
  'https://images.unsplash.com/photo-1542385151-efd9000785fd?w=800&q=80',    // joueur dribble
  'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80', // stade nocturne
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80', // célébration
  'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&q=80',    // ballon de foot
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80', // match stade
  'https://images.unsplash.com/photo-1522778034537-20a2486be803?w=800&q=80', // tribunes stade
];

const getTransferImage = (playerId, teamId) =>
  TRANSFER_IMAGES[(playerId + teamId) % TRANSFER_IMAGES.length];

// ─── 4. Transferts réels → articles ───────────────────────────────────────────
async function createTransferArticles() {
  const API_KEY = process.env.FOOTBALL_API_KEY;
  if (!API_KEY) return;

  const TEAM_IDS = [85, 50, 541, 40, 529];

  for (const teamId of TEAM_IDS) {
    try {
      const { data } = await axios.get('https://v3.football.api-sports.io/transfers', {
        params: { team: teamId },
        headers: { 'x-apisports-key': API_KEY },
        timeout: 12000,
      });

      const recent = (data.response ?? []).filter(t => {
        const year = new Date(t.transfers?.[0]?.date).getFullYear();
        return year >= 2026;
      }).slice(0, 3);

      for (const t of recent) {
        const tr  = t.transfers[0];
        const p   = t.player;
        const fee  = tr.fee || 'Montant non divulgué';
        const type = tr.type?.toLowerCase().includes('loan') ? 'Prêt' :
                     tr.type?.toLowerCase().includes('free') ? 'Libre' : 'Définitif';
        const toTeam   = tr.teams?.in?.name  ?? 'Club inconnu';
        const fromTeam = tr.teams?.out?.name ?? 'Club inconnu';
        const inId     = tr.teams?.in?.id    ?? 0;
        const title    = `${type === 'Prêt' ? 'PRÊT' : 'OFFICIEL'} : ${p.name} rejoint ${toTeam}`;
        const slug     = slugify(title) + '-' + (tr.date ?? Date.now());
        // Logos publics API-Football (accessibles sans auth) comme vignette + image Unsplash en fond
        const imageUrl = getTransferImage(p.id ?? 0, inId);

        await pool.execute(
          `INSERT INTO articles
             (slug, title, summary, content, image_url, category, author, published_at)
           VALUES (?, ?, ?, ?, ?, 'TRANSFERT', 'Rédaction KickZone', ?)
           ON DUPLICATE KEY UPDATE
             title     = VALUES(title),
             summary   = VALUES(summary),
             content   = VALUES(content),
             image_url = VALUES(image_url)`,
          [
            slug,
            title,
            `${p.name} quitte ${fromTeam} pour rejoindre ${toTeam}. Type : ${type}. Montant : ${fee}.`,
            `<p><strong>${p.name}</strong> a rejoint officiellement <strong>${toTeam}</strong> en provenance de <strong>${fromTeam}</strong>.</p><p>Type d'opération : <strong>${type}</strong>. Montant : <strong>${fee}</strong>.</p>`,
            imageUrl,
            new Date(tr.date),
          ]
        );
        console.log(`  ✅ Transfert : ${title.substring(0, 60)}`);
      }
      await sleep(400);
    } catch (e) {
      console.log(`  ⚠️  Erreur team ${teamId} :`, e.message);
    }
  }
  console.log('[SEED] ✅ Articles transferts créés');
}

// ─── 5. Articles éditoriaux + vrais transferts mercato été 2026 ───────────────
const EDITORIAL = [
  { slug: 'cdm2026-bilan-phase-groupes',
    title: 'Coupe du Monde 2026 : le bilan de la phase de groupes',
    summary: 'France qualifiée, Brésil en difficulté, Allemagne surprenante. Retour sur la phase de groupes.',
    category: 'ACTU',
    imageUrl: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?w=800',
    date: new Date('2026-06-28') },
  { slug: 'mbappe-cdm-2026-analyse',
    title: 'Mbappé en Coupe du Monde 2026 : l\'heure de la confirmation',
    summary: 'À 27 ans, Kylian Mbappé dispute sa deuxième Coupe du Monde. Analyse de ses performances et de son leadership.',
    category: 'ANALYSE',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    date: new Date('2026-06-27') },
  { slug: 'cdm2026-huitiemes-preview',
    title: 'Huitièmes CdM 2026 : le guide complet des affiches',
    summary: 'France-Portugal, Brésil-Espagne, Angleterre-Argentine... toutes les affiches analysées.',
    category: 'ANALYSE',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    date: new Date('2026-06-29') },
  { slug: 'cdm2026-stades-usa',
    title: 'Coupe du Monde 2026 : les stades américains qui font rêver',
    summary: 'MetLife, Rose Bowl, Azteca... La CdM 2026 s\'organise dans des enceintes mythiques à travers les États-Unis.',
    category: 'ACTU',
    imageUrl: 'https://images.unsplash.com/photo-1506025346009-a0e2c07b5fcf?w=800',
    date: new Date('2026-06-25') },
  { slug: 'vinicius-cdm-2026-bresil',
    title: 'Vinicius Jr : peut-il porter le Brésil vers le titre mondial ?',
    summary: 'Ballon d\'Or 2025, Vinicius Junior est le grand espoir brésilien pour décrocher un 6e titre mondial.',
    category: 'ANALYSE',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    date: new Date('2026-06-26') },
  { slug: 'interview-exclusive-coach-bleus-2026',
    title: 'Interview : le sélectionneur des Bleus avant les huitièmes',
    summary: 'Rencontre avec le staff des Bleus, leur préparation et leurs ambitions pour la suite de la compétition.',
    category: 'INTERVIEW',
    imageUrl: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800',
    date: new Date('2026-06-24') },
  // Vrais transferts officiels été 2026
  { slug: 'officiel-gordon-barcelone-2026',
    title: 'OFFICIEL : Anthony Gordon rejoint le FC Barcelone pour 70M€',
    summary: 'L\'ailier anglais de Newcastle signe un contrat de 5 ans au Barça. Le transfert est estimé à 70M€, potentiellement 80M€ avec les bonus.',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
    content: '<p>Le FC Barcelone a officialisé l\'arrivée d\'<strong>Anthony Gordon</strong> en provenance de <strong>Newcastle United</strong>. L\'international anglais de 24 ans s\'est engagé pour <strong>5 ans</strong> avec le club catalan, pour un montant de base de <strong>70 millions d\'euros</strong>, pouvant atteindre <strong>80 millions€</strong> avec les clauses de performance.</p><p>Gordon, révélation de la saison 2024-25 en Premier League, apportera sa vitesse et sa créativité sur le flanc gauche d\'Hansi Flick.</p>',
    date: new Date('2026-06-01') },
  { slug: 'officiel-cucurella-real-madrid-2026',
    title: 'OFFICIEL : Marc Cucurella au Real Madrid pour 55M€',
    summary: 'Le latéral gauche espagnol quitte Chelsea pour rejoindre le Real Madrid. Contrat 6 ans pour 55M€ plus bonus.',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785fd?w=800',
    content: '<p>Le <strong>Real Madrid</strong> a officialisé le transfert de <strong>Marc Cucurella</strong> en provenance de <strong>Chelsea</strong>. L\'Espagnol, révélé à Brighton puis confirmé chez les Blues, s\'engage pour <strong>6 saisons</strong> au Santiago Bernabéu. Le montant du transfert est de <strong>55 millions d\'euros</strong>, pouvant atteindre 60M€ avec les bonus.</p>',
    date: new Date('2026-06-15') },
  { slug: 'officiel-quenda-chelsea-2026',
    title: 'OFFICIEL : Geovany Quenda débarque à Chelsea pour 52M€',
    summary: 'La pépite portugaise de 18 ans du Sporting CP rejoint enfin Chelsea après un accord signé en mars 2025. Un des meilleurs jeunes d\'Europe.',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
    content: '<p><strong>Geovany Quenda</strong>, 18 ans, a rejoint <strong>Chelsea</strong> en provenance du <strong>Sporting CP</strong> pour <strong>52 millions d\'euros</strong>. Le talent portugais, considéré comme l\'un des meilleurs jeunes d\'Europe, s\'est engagé jusqu\'en juin 2033. Chelsea a réussi à doubler Manchester United sur ce dossier en négociant secrètement depuis des mois.</p>',
    date: new Date('2026-07-01') },
  { slug: 'officiel-jacquet-liverpool-2026',
    title: 'OFFICIEL : Jérémy Jacquet signe à Liverpool pour 60M€',
    summary: 'Le défenseur central de 20 ans de Stade Rennais rejoint les Reds pour 60M€. Liverpool devance Newcastle pour s\'offrir l\'international français.',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    content: '<p><strong>Liverpool</strong> a officialisé la signature de <strong>Jérémy Jacquet</strong>, défenseur central de 20 ans du <strong>Stade Rennais</strong>. Le montant du transfert s\'élève à <strong>60 millions d\'euros</strong> (55M£ fixes + 5M£ de bonus). Jacquet, révélation de la Ligue 1 cette saison, s\'engage pour <strong>5 ans</strong> à Anfield.</p>',
    date: new Date('2026-06-20') },
  { slug: 'psg-diomande-accord-2026',
    title: 'PSG : accord contractuel trouvé avec Yan Diomandé (Leipzig)',
    summary: 'L\'ailier ivoirien, brillant à la CdM 2026, a accepté un contrat de 5 ans avec le PSG. Paris négocie maintenant avec Leipzig autour de 100-130M€.',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    content: '<p>Le <strong>Paris Saint-Germain</strong> a trouvé un accord contractuel avec <strong>Yan Diomandé</strong> (RB Leipzig). L\'ailier ivoirien de 22 ans, révélation de la Coupe du Monde 2026 avec la Côte d\'Ivoire, a accepté un contrat de <strong>5 ans</strong> avec Paris. Les négociations avec Leipzig portent sur un montant estimé entre <strong>100 et 130 millions d\'euros</strong>.</p>',
    date: new Date('2026-06-26') },
  { slug: 'atletico-grimaldo-kangin-2026',
    title: 'Atlético Madrid : double recrutement avec Grimaldo et Kang-in Lee',
    summary: 'Les Colchoneros finalisent deux arrivées pour environ 55M€ : Alejandro Grimaldo (Leverkusen, 20M€) et Kang-in Lee (PSG, 35M€).',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800',
    content: '<p>L\'<strong>Atlético de Madrid</strong> prépare un double coup sur le mercato estival 2026 avec les arrivées attendues d\'<strong>Alejandro Grimaldo</strong> (Bayer Leverkusen, ~20M€) et de <strong>Kang-in Lee</strong> (PSG, ~35M€). L\'investissement total frôle les <strong>55 millions d\'euros</strong>. Les deux joueurs ont donné leur accord, et les clubs négocient les détails finaux.</p>',
    date: new Date('2026-06-25') },
  { slug: 'mercato-ete-2026-bilan',
    title: 'Mercato été 2026 : le bilan des premiers coups de la fenêtre',
    summary: 'Gordon à Barcelone, Cucurella au Real, Quenda à Chelsea... Retour sur les transferts qui agitent déjà l\'été 2026.',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    date: new Date('2026-06-29') },
];

async function createEditorialArticles() {
  for (const a of EDITORIAL) {
    await pool.execute(
      `INSERT INTO articles (slug, title, summary, content, image_url, category, author, published_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Rédaction KickZone', ?)
       ON DUPLICATE KEY UPDATE
         title     = VALUES(title),
         summary   = VALUES(summary),
         content   = VALUES(content),
         image_url = VALUES(image_url)`,
      [a.slug, a.title, a.summary, a.content ?? null, a.imageUrl, a.category, a.date]
    );
    console.log(`  ✅ Article: ${a.title.substring(0, 55)}...`);
  }
  console.log('[SEED] ✅ Articles éditoriaux créés');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Démarrage seed KickZone (mysql2)...\n');

  const adminId = await createAdmin();

  console.log('\n[SEED] Articles éditoriaux...');
  await createEditorialArticles();

  console.log('\n[SEED] Matchs API Football...');
  const fixtures = await getUpcomingFixtures();
  await createPronostics(fixtures, adminId);

  console.log('\n[SEED] Transferts API Football...');
  await createTransferArticles();

  const [[{ total_articles }]] = await pool.execute('SELECT COUNT(*) as total_articles FROM articles');
  const [[{ total_pronos }]]   = await pool.execute('SELECT COUNT(*) as total_pronos FROM pronostics');
  console.log(`\n✅ SEED TERMINÉ — ${total_articles} articles, ${total_pronos} pronostics`);

  await pool.end();
}

main().catch(e => { console.error('[SEED] ❌', e.message); process.exit(1); });
