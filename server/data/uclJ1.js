// server/data/uclJ1.js — matchs de la 1re journée de Ligue des Champions 2026/2027
// (8-10 septembre 2026), au format de l'API-Football.
// Sert de repli quand FOOTBALL_API_KEY n'est pas configurée, pour que les pages
// Matchs / Accueil affichent quand même de vrais matchs le 8 septembre.

const LOGO = (id) => `https://media.api-sports.io/football/teams/${id}.png`;

// [heure "HH:MM", domId, dom, extId, ext]
const DAYS = {
  '2026-09-08': [
    ['18:45', 569, 'Club Bruges', 66, 'Aston Villa'],
    ['18:45', 566, 'AEK Athènes', 4030, 'LASK'],
    ['21:00', 79, 'Lille', 543, 'Real Betis'],
    ['21:00', 212, 'FC Porto', 50, 'Manchester City'],
    ['21:00', 165, 'Borussia Dortmund', 533, 'Villarreal'],
    ['21:00', 541, 'Real Madrid', 505, 'Inter Milan'],
  ],
  '2026-09-09': [
    ['18:45', 529, 'FC Barcelone', 209, 'Feyenoord'],
    ['18:45', 172, 'VfB Stuttgart', 331, 'Viking FK'],
    ['21:00', 492, 'Napoli', 42, 'Arsenal'],
    ['21:00', 40, 'Liverpool', 530, 'Atlético de Madrid'],
    ['21:00', 228, 'Sporting CP', 645, 'Galatasaray'],
    ['21:00', 85, 'Paris Saint-Germain', 656, 'Slovan Bratislava'],
  ],
  '2026-09-10': [
    ['18:45', 677, 'PSV Eindhoven', 550, 'Shakhtar Donetsk'],
    ['18:45', 611, 'Fenerbahçe', 497, 'AS Roma'],
    ['21:00', 1579, 'Côme', 173, 'RB Leipzig'],
    ['21:00', 33, 'Manchester United', 1005, 'Sabah FC'],
    ['21:00', 552, 'Slavia Prague', 116, 'RC Lens'],
    ['21:00', 157, 'Bayern Munich', 327, 'Bodø/Glimt'],
  ],
};

const LEAGUE = {
  id: 2,
  name: 'UEFA Champions League',
  logo: 'https://media.api-sports.io/football/leagues/2.png',
  round: 'League Phase - 1',
  season: 2026,
};

// Construit les matchs d'une date au format API-Football (ou [] si date inconnue).
const fixturesForDate = (date) => {
  const rows = DAYS[date];
  if (!rows) return [];
  return rows.map(([time, homeId, home, awayId, away], i) => ({
    fixture: {
      id: 900000 + Number(date.replaceAll('-', '')) % 100000 + i,
      date: new Date(`${date}T${time}:00+02:00`).toISOString(),
      status: { short: 'NS', long: 'Not Started', elapsed: null },
      venue: { name: null, city: null },
    },
    league: LEAGUE,
    teams: {
      home: { id: homeId, name: home, logo: LOGO(homeId) },
      away: { id: awayId, name: away, logo: LOGO(awayId) },
    },
    goals: { home: null, away: null },
    score: { halftime: {}, fulltime: {} },
  }));
};

module.exports = { fixturesForDate };
