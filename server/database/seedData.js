// database/seedData.js — données de départ (articles + matchs de démo).
// Le "quoi" ; la logique d'insertion est dans seed.js (le "comment").

// Images Unsplash publiques (pas d'authentification), tournées pour les articles transferts.
const TRANSFER_IMAGES = [
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
  'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80',
  'https://images.unsplash.com/photo-1542385151-efd9000785fd?w=800&q=80',
  'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
  'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&q=80',
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80',
  'https://images.unsplash.com/photo-1522778034537-20a2486be803?w=800&q=80',
];

// Matchs de démonstration si l'API Football n'est pas configurée
// (pour que la page Pronostics ne soit jamais vide).
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

// Articles de la rédaction — saison 2026/2027 & mercato d'été 2026.
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

module.exports = { TRANSFER_IMAGES, demoFixtures, EDITORIAL };
