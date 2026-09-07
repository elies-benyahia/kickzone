// database/seed.js — remplit la base : admin, articles, pronostics.
// Lancé par "npm run db:reset" (main) ou au démarrage si la base est vide (seedIfEmpty).

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const axios  = require('axios');
const pool   = require('../config/db');

const sleep = (ms) => new Promise(r => setTimeout(r, ms)); // petite pause entre 2 appels API

// Même fonction que dans articleService : titre -> slug d'URL.
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
  // OR IGNORE : ne fait rien si l'admin existe déjà (email unique).
  await pool.execute(
    'INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)',
    [process.env.ADMIN_EMAIL || 'admin@kickzone.fr', hash, 'ADMIN']
  );
  const [[admin]] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [
    process.env.ADMIN_EMAIL || 'admin@kickzone.fr',
  ]);
  console.log('[SEED] ✅ Admin créé');
  return admin.id;
}

// ─── 2. Matchs à venir ───────────────────────────────────────────────────────
// Ligues suivies pour les pronostics
const IMPORTANT_LEAGUES = new Set([2, 3, 39, 61, 78, 135, 140]); // UCL, UEL, PL, L1, Bundesliga, Serie A, Liga

// Matchs de démonstration : utilisés si l'API Football n'est pas configurée,
// pour que la page Pronostics ne soit jamais vide.
function demoFixtures() {
  const mk = (id, h, a, league, daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(21, 0, 0, 0);
    return {
      fixture: { id, date: d.toISOString() },
      league: { name: league },
      teams: { home: { id, name: h }, away: { id: id + 1, name: a } },
    };
  };
  return [
    mk(9001, 'Paris Saint-Germain', 'Manchester City', 'Ligue des Champions', 2),
    mk(9003, 'Real Madrid', 'Bayern Munich', 'Ligue des Champions', 3),
    mk(9005, 'Liverpool', 'Arsenal', 'Premier League', 4),
    mk(9007, 'Marseille', 'Monaco', 'Ligue 1', 5),
    mk(9009, 'Barcelone', 'Atlético Madrid', 'La Liga', 6),
    mk(9011, 'Inter Milan', 'Juventus', 'Serie A', 7),
  ];
}

async function getUpcomingFixtures() {
  const API_KEY = process.env.FOOTBALL_API_KEY;
  if (!API_KEY) {
    console.log('[SEED] ⚠️  FOOTBALL_API_KEY manquant — matchs de démonstration utilisés');
    return demoFixtures();
  }

  // Prochains jours, ligues majeures uniquement
  const fixtures = [];
  for (let i = 0; i <= 6 && fixtures.length < 8; i++) {
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
  return fixtures.length ? fixtures.slice(0, 8) : demoFixtures();
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
           ON CONFLICT(slug) DO UPDATE SET
             title     = excluded.title,
             summary   = excluded.summary,
             content   = excluded.content,
             image_url = excluded.image_url`,
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

// ─── 5. Articles éditoriaux — saison 2026/2027 & mercato d'été 2026 ───────────
const EDITORIAL = [
  { slug: 'mercato-ete-2026-record',
    title: 'Mercato été 2026 : un nouveau record avec 8,5 milliards d\'euros dépensés',
    summary: 'La fenêtre estivale 2026, fermée le 1er septembre, bat tous les records : plus de 12 000 transferts internationaux et 8,5 milliards d\'euros investis.',
    category: 'ACTU',
    imageUrl: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?w=800',
    content: '<p>Le mercato estival 2026 restera dans les livres. Selon les chiffres de la FIFA, plus de <strong>12 000 transferts internationaux</strong> ont été enregistrés pour un volume total de <strong>8,5 milliards d\'euros</strong>, porté par une Premier League toujours plus dépensière.</p><p>Six opérations ont dépassé la barre des 100 millions d\'euros, emmenées par <strong>Enzo Fernández</strong> (Chelsea → Manchester City, 145 M€) et <strong>Yan Diomandé</strong> (Leipzig → Real Madrid, 130 M€).</p>',
    date: new Date('2026-09-02') },
  { slug: 'officiel-enzo-fernandez-manchester-city-2026',
    title: 'OFFICIEL : Enzo Fernández à Manchester City pour 145M€',
    summary: 'Le champion du monde argentin quitte Chelsea pour Manchester City. À 145 M€, c\'est le transfert le plus cher de l\'été 2026.',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
    content: '<p><strong>Manchester City</strong> a officialisé l\'arrivée d\'<strong>Enzo Fernández</strong> en provenance de <strong>Chelsea</strong> pour un montant de <strong>145 millions d\'euros</strong>. Le milieu argentin, 25 ans, s\'engage pour cinq saisons et devient la recrue la plus chère de l\'histoire du club.</p><p>Pep Guardiola tient le successeur de Rodri au cœur du jeu mancunien.</p>',
    date: new Date('2026-08-12') },
  { slug: 'officiel-diomande-real-madrid-2026',
    title: 'OFFICIEL : Yan Diomandé rejoint le Real Madrid pour 130M€',
    summary: 'L\'ailier ivoirien de 20 ans quitte le RB Leipzig pour le Real Madrid après une saison exceptionnelle en Bundesliga.',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    content: '<p>Le <strong>Real Madrid</strong> a bouclé la signature de <strong>Yan Diomandé</strong> (RB Leipzig) pour <strong>130 millions d\'euros</strong>. L\'international ivoirien de 20 ans, l\'un des plus gros espoirs du football européen, signe jusqu\'en 2033.</p>',
    date: new Date('2026-08-05') },
  { slug: 'officiel-barcola-liverpool-2026',
    title: 'OFFICIEL : Bradley Barcola signe à Liverpool (125M€ + bonus)',
    summary: 'Après trois saisons au PSG, l\'ailier international français rejoint Liverpool pour 125 M€ plus 20 M€ de bonus.',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    content: '<p><strong>Liverpool</strong> a officialisé la venue de <strong>Bradley Barcola</strong> en provenance du <strong>Paris Saint-Germain</strong>. L\'opération est estimée à <strong>125 millions d\'euros</strong>, auxquels s\'ajoutent 20 M€ de bonus. Le Français de 23 ans s\'engage pour cinq ans à Anfield.</p>',
    date: new Date('2026-07-20') },
  { slug: 'officiel-bruno-guimaraes-arsenal-2026',
    title: 'OFFICIEL : Bruno Guimarães quitte Newcastle pour Arsenal (85M€)',
    summary: 'Le milieu brésilien rejoint Arsenal pour 85 M€. Les Gunners densifient leur entrejeu pour viser le titre.',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    content: '<p><strong>Arsenal</strong> a officialisé le transfert de <strong>Bruno Guimarães</strong> (Newcastle) pour <strong>85 millions d\'euros</strong>. Le métronome brésilien, 28 ans, apporte son expérience de la Ligue des Champions au milieu de Mikel Arteta.</p>',
    date: new Date('2026-07-15') },
  { slug: 'rodri-barcelone-coup-de-tonnerre-2026',
    title: 'Coup de tonnerre : Rodri quitte Manchester City pour le FC Barcelone',
    summary: 'Le Ballon d\'Or 2024 s\'engage avec le Barça pour 75 M€ dans les tout derniers jours du mercato.',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800',
    content: '<p>Fin de mercato tonitruante : <strong>Rodri</strong> quitte <strong>Manchester City</strong> après six saisons pour rejoindre le <strong>FC Barcelone</strong> contre <strong>75 millions d\'euros</strong>. Le milieu espagnol de 30 ans retrouve la Liga et devient le patron de l\'entrejeu catalan.</p>',
    date: new Date('2026-08-25') },
  { slug: 'officiel-gordon-barcelone-2026',
    title: 'OFFICIEL : Anthony Gordon rejoint le FC Barcelone pour 70M€',
    summary: 'Premier gros coup de l\'été : l\'ailier anglais de Newcastle signe cinq ans au Barça pour 70 M€ (jusqu\'à 80 M€ avec les bonus).',
    category: 'TRANSFERT',
    imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
    content: '<p>Le <strong>FC Barcelone</strong> a officialisé l\'arrivée d\'<strong>Anthony Gordon</strong> en provenance de <strong>Newcastle United</strong>. L\'international anglais de 25 ans s\'engage pour <strong>5 ans</strong>, pour un montant de base de <strong>70 millions d\'euros</strong>, jusqu\'à 80 M€ avec les bonus.</p>',
    date: new Date('2026-06-20') },
  { slug: 'psg-akliouche-ferran-torres-2026',
    title: 'PSG : Akliouche et Ferran Torres pour compenser le départ de Barcola',
    summary: 'Paris a recruté Maghnes Akliouche (Monaco, 50 M€) et Ferran Torres (Barcelone, 48 M€) pour regarnir ses ailes après la vente de Barcola.',
    category: 'ANALYSE',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    date: new Date('2026-08-16') },
  { slug: 'premier-league-depenses-ete-2026',
    title: 'Premier League : plus de 4 milliards d\'euros dépensés cet été',
    summary: 'Les clubs anglais ont encore écrasé le marché : Manchester City deux fois sur le podium des plus gros transferts de l\'été.',
    category: 'ACTU',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
    date: new Date('2026-09-01') },
  { slug: 'ligue-des-champions-2026-27-programme',
    title: 'Ligue des Champions 2026-2027 : le programme de la phase de ligue',
    summary: '36 équipes, un classement unique, 8 journées de la mi-septembre à fin janvier. Tout le calendrier de la phase de ligue.',
    category: 'ACTU',
    imageUrl: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?w=800',
    content: '<p>La phase de ligue de la <strong>Ligue des Champions 2026-2027</strong> se déroule du <strong>8 septembre 2026</strong> au <strong>27 janvier 2027</strong>. Les 8 premiers du classement unique sont qualifiés pour les 8es de finale, les équipes de la 9e à la 24e place passent par un tour de barrages, et les 12 dernières sont éliminées.</p>',
    date: new Date('2026-08-29') },
  { slug: 'ldc-j1-2026-affiches',
    title: 'Ligue des Champions, J1 : Real Madrid-Inter et Liverpool-Atlético en têtes d\'affiche',
    summary: 'La première journée s\'ouvre le 8 septembre. Au menu : Real Madrid-Inter, FC Porto-Manchester City et Liverpool-Atlético.',
    category: 'ANALYSE',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    date: new Date('2026-09-06') },
  { slug: 'ligue-1-2026-27-avant-saison',
    title: 'Ligue 1 2026-2027 : ce qu\'il faut attendre de la saison',
    summary: 'PSG toujours favori, un OM ambitieux, Lille qui rêve d\'Europe avec Giroud : le tour d\'horizon avant le coup d\'envoi.',
    category: 'ANALYSE',
    imageUrl: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800',
    date: new Date('2026-08-14') },
  { slug: 'interview-mercato-2026-cinq-transferts',
    title: 'Mercato 2026 : les 5 transferts qui vont changer la saison',
    summary: 'Enzo Fernández, Diomandé, Barcola, Rodri, Guimarães : la rédaction décrypte les mouvements qui pèseront le plus.',
    category: 'INTERVIEW',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    date: new Date('2026-08-31') },
];

async function createEditorialArticles() {
  for (const a of EDITORIAL) {
    await pool.execute(
      `INSERT INTO articles (slug, title, summary, content, image_url, category, author, published_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Rédaction KickZone', ?)
       ON CONFLICT(slug) DO UPDATE SET
         title     = excluded.title,
         summary   = excluded.summary,
         content   = excluded.content,
         image_url = excluded.image_url`,
      [a.slug, a.title, a.summary, a.content ?? null, a.imageUrl, a.category, a.date]
    );
    console.log(`  ✅ Article: ${a.title.substring(0, 55)}...`);
  }
  console.log('[SEED] ✅ Articles éditoriaux créés');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
// closePool=false quand le serveur appelle le seed au démarrage (il continue de tourner).
async function main({ closePool = true } = {}) {
  console.log('🌱 Démarrage seed KickZone...\n');

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

  if (closePool) await pool.end();
}

// Remplit la base seulement si elle est vide (appelée par index.js au démarrage).
async function seedIfEmpty() {
  try {
    const [[{ n }]] = await pool.execute('SELECT COUNT(*) AS n FROM articles');
    if (n > 0) return; // déjà des données -> on ne touche à rien
    console.log('[SEED] Base vide détectée — seed automatique...');
    await main({ closePool: false }); // on garde la connexion, le serveur continue de tourner
  } catch (e) {
    console.error('[SEED] seedIfEmpty échoué :', e.message);
  }
}

module.exports = { main, seedIfEmpty };

// Vrai seulement si lancé directement (node database/seed.js), pas si importé par index.js.
if (require.main === module) {
  main().catch(e => { console.error('[SEED] ❌', e.message); process.exit(1); });
}
