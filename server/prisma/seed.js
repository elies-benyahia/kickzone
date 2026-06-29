require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin2024!', 12);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@kickzone.fr' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@kickzone.fr',
      password: hash,
      role: 'ADMIN',
    },
  });
  console.log('[SEED] Admin user created:', admin.email);

  // Articles
  const articles = [
    {
      slug: 'mbappe-prolonge-real-madrid',
      title: 'Officiel : Mbappé prolonge au Real Madrid jusqu\'en 2028',
      summary: 'Après des mois de négociations intenses, Kylian Mbappé a signé une prolongation de trois ans avec le Real Madrid. Le Français reste la pierre angulaire du projet merengue.',
      content: 'Le Real Madrid a annoncé ce lundi la prolongation de Kylian Mbappé jusqu\'en 2028. L\'attaquant français, arrivé libre en 2024, a rapidement conquis le Bernabéu avec ses performances XXL. Son salaire serait revu à la hausse pour en faire l\'un des joueurs les mieux payés du monde. Florentino Pérez a déclaré : "Kylian est le présent et l\'avenir de ce club."',
      category: 'TRANSFERT',
      author: 'Rédaction KickZone',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      publishedAt: new Date('2026-06-15'),
    },
    {
      slug: 'osimhen-arsenal-nego-avancees',
      title: 'Osimhen vers Arsenal : les négociations très avancées',
      summary: 'Victor Osimhen serait à deux doigts de rejoindre Arsenal cet été. Les Gunners auraient soumis une offre de 90M€ à Naples, qui examine la proposition.',
      content: 'Arsenal frappe fort sur le marché estival. Les Gunners ont transmis une offre formelle de 90 millions d\'euros à Naples pour Victor Osimhen. Le Nigérian, sous contrat jusqu\'en 2026, aurait donné son accord personnel au club londonien. Mikel Arteta verrait en lui le successeur idéal pour emmener Arsenal vers le titre de champion d\'Angleterre.',
      category: 'TRANSFERT',
      author: 'Rédaction KickZone',
      imageUrl: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800',
      publishedAt: new Date('2026-06-20'),
    },
    {
      slug: 'haaland-psg-rumeur-folle',
      title: 'Haaland au PSG : la rumeur qui affole le mercato',
      summary: 'Le PSG songerait à recruter Erling Haaland pour 150M€. Une opération pharaonique qui transformerait le projet qatari.',
      content: 'C\'est la rumeur qui enflamme les réseaux sociaux : Erling Haaland pourrait quitter Manchester City direction Paris. Le PSG, renforcé par ses nouvelles ressources financières, serait prêt à casser sa tirelire. Haaland, tentant par le projet, hésiterait toutefois à quitter l\'Angleterre où il s\'est épanoui.',
      category: 'TRANSFERT',
      author: 'Rédaction KickZone',
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
      publishedAt: new Date('2026-06-22'),
    },
    {
      slug: 'tactique-psg-domine-ligue1',
      title: 'Tactique : pourquoi le PSG écrase la Ligue 1',
      summary: 'Analyse complète du système de jeu parisien : pressing haut, transitions rapides, et exploitation des espaces. Le PSG 2025-26 est-il la meilleure équipe de l\'histoire du championnat ?',
      content: 'Le PSG de cette saison est d\'une efficacité redoutable. Avec un pressing haut organisé et des transitions ultra-rapides, Luis Enrique a construit une machine à gagner. Statistiquement, les Parisiens dominent chaque indicateur : possession (63%), xG (2.4 par match), interceptions hautes (18 par rencontre). On analyse en détail pourquoi cette équipe est historique.',
      category: 'ANALYSE',
      author: 'Théo Dupont',
      imageUrl: 'https://images.unsplash.com/photo-1517747614396-d21a78b850e8?w=800',
      publishedAt: new Date('2026-06-10'),
    },
    {
      slug: 'analyse-premiere-league-season-review',
      title: 'Premier League 2025-26 : le bilan de la saison',
      summary: 'Manchester City champion, Arsenal meilleur attaque, Chelsea en reconstruction. Retour sur les faits marquants d\'une saison exceptionnelle.',
      content: 'La saison de Premier League 2025-26 restera dans les mémoires. City encore champion malgré une résistance inattendue d\'Arsenal. Liverpool en retrait. Chelsea qui retrouve des couleurs. On fait le tour complet des 20 clubs avec les notes, les joueurs de l\'année et les déceptions.',
      category: 'ANALYSE',
      author: 'Marie Lambert',
      imageUrl: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800',
      publishedAt: new Date('2026-06-05'),
    },
    {
      slug: 'analyse-euro2026-favoris',
      title: 'Euro 2026 : qui sont les vrais favoris ?',
      summary: 'À quelques semaines de l\'Euro 2026, on dresse le portrait des équipes capables de soulever le trophée. France, Espagne, Angleterre : le grand choc attendu.',
      content: 'L\'Euro 2026 approche à grands pas. La France, tenante du titre, part favorite avec son effectif pléthorique. L\'Espagne de la génération dorée Pedri-Gavi impressionne. L\'Angleterre veut enfin gagner un tournoi majeur. Mais l\'Allemagne à domicile et le Portugal de Fernandez peuvent créer la surprise.',
      category: 'ANALYSE',
      author: 'Jean-Marc Tessier',
      imageUrl: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800',
      publishedAt: new Date('2026-06-18'),
    },
    {
      slug: 'ligue1-journee-34-resume',
      title: 'Résumé J34 Ligue 1 : PSG champion, Nice en Europa',
      summary: 'Le PSG a officiellement été sacré champion de Ligue 1 après sa victoire 3-0 contre Lyon. Nice assure l\'Europa League, Lorient relégué.',
      content: 'La 34e journée de Ligue 1 a rendu son verdict. Le PSG, déjà assuré du titre, a conclu en beauté face à Lyon (3-0) avec un doublé de Gonçalo Ramos. Nice finit 3e et disputera l\'Europa League. À l\'autre bout, Lorient est officiellement relégué en Ligue 2 après sa défaite à Brest.',
      category: 'ACTU',
      author: 'Rédaction KickZone',
      imageUrl: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800',
      publishedAt: new Date('2026-05-28'),
    },
    {
      slug: 'champions-league-finale-preview',
      title: 'Finale LDC : Real Madrid vs Manchester City, le choc des titans',
      summary: 'Samedi soir, le Real Madrid affronte Manchester City à Wembley pour la finale de la Ligue des Champions. Qui soulèvera la Coupe aux grandes oreilles ?',
      content: 'L\'affiche de rêve est au rendez-vous. Real Madrid contre Manchester City à Wembley. Les Merengues ont éliminé le Bayern en demi-finale, City a eu la peau du PSG. Deux visions du football, deux styles opposés. Présentation tactique, joueurs à suivre, pronostic de la rédaction.',
      category: 'ACTU',
      author: 'Lucas Moreau',
      imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
      publishedAt: new Date('2026-06-01'),
    },
    {
      slug: 'interview-vinicius-ballon-or',
      title: 'Interview : Vinicius Jr — "Je mérite le Ballon d\'Or cette année"',
      summary: 'Rencontre exclusive avec Vinicius Junior, candidat numéro 1 au Ballon d\'Or 2026. L\'attaquant brésilien se confie sur ses ambitions et sa progression.',
      content: '"Cette saison, j\'ai tout donné. Les chiffres parlent d\'eux-mêmes." Vinicius Junior nous a reçus dans sa villa madrilène pour une interview fleuve. Au programme : son évolution tactique, sa relation avec Mbappé, son rêve de remporter le Ballon d\'Or, et son avenir en sélection brésilienne.',
      category: 'INTERVIEW',
      author: 'Sophie Renard',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      publishedAt: new Date('2026-06-12'),
    },
    {
      slug: 'interview-guardiola-heritage',
      title: 'Guardiola : "Mon héritage à City, c\'est d\'avoir changé le football anglais"',
      summary: 'Pep Guardiola accorde une longue interview au terme de son contrat à Manchester City. Bilan, regrets, prochaine destination.',
      content: '"Je suis arrivé en Angleterre avec des idées, je repars avec des certitudes." Pep Guardiola se livre dans une interview rare. Il revient sur ses dix ans à City, ses relations avec les joueurs, les défaites en finale de LDC, et son prochain défi. Brésil ? Angleterre nationale ? Il répond sans filtre.',
      category: 'INTERVIEW',
      author: 'Pierre Fabre',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      publishedAt: new Date('2026-06-08'),
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }
  console.log('[SEED] 10 articles created');

  // Pronostics
  const pronostics = [
    {
      fixtureId: 1001,
      homeTeam: 'PSG',
      awayTeam: 'Marseille',
      prediction: 'Victoire PSG 2-0, Mbappé buteur',
      result: 'CORRECT',
      confidence: 85,
      league: 'Ligue 1',
      matchDate: new Date('2026-05-15'),
      userId: admin.id,
    },
    {
      fixtureId: 1002,
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      prediction: 'Match nul 1-1, Vinicius ouvre le score',
      result: 'CORRECT',
      confidence: 60,
      league: 'La Liga',
      matchDate: new Date('2026-05-20'),
      userId: admin.id,
    },
    {
      fixtureId: 1003,
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      prediction: 'Victoire Arsenal 1-0 surprise',
      result: 'RATE',
      confidence: 35,
      league: 'Premier League',
      matchDate: new Date('2026-05-22'),
      userId: admin.id,
    },
    {
      fixtureId: 1004,
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      prediction: 'Victoire Bayern 3-1, Musiala hat-trick',
      result: 'RATE',
      confidence: 70,
      league: 'Bundesliga',
      matchDate: new Date('2026-05-25'),
      userId: admin.id,
    },
    {
      fixtureId: 1005,
      homeTeam: 'Inter Milan',
      awayTeam: 'Juventus',
      prediction: 'Victoire Inter 2-1, derby intense',
      result: 'CORRECT',
      confidence: 65,
      league: 'Serie A',
      matchDate: new Date('2026-06-01'),
      userId: admin.id,
    },
    {
      fixtureId: 1006,
      homeTeam: 'France',
      awayTeam: 'Espagne',
      prediction: 'Victoire France 2-1 après prolongations',
      result: null,
      confidence: 55,
      league: 'Euro 2026',
      matchDate: new Date('2026-07-10'),
      userId: admin.id,
    },
    {
      fixtureId: 1007,
      homeTeam: 'Liverpool',
      awayTeam: 'Chelsea',
      prediction: 'Match nul 2-2, match spectaculaire',
      result: null,
      confidence: 45,
      league: 'Premier League',
      matchDate: new Date('2026-07-05'),
      userId: admin.id,
    },
    {
      fixtureId: 1008,
      homeTeam: 'Atletico Madrid',
      awayTeam: 'Sevilla',
      prediction: 'Victoire Atletico 1-0, Griezmann décisif',
      result: null,
      confidence: 75,
      league: 'La Liga',
      matchDate: new Date('2026-07-08'),
      userId: admin.id,
    },
  ];

  for (const prono of pronostics) {
    await prisma.pronostic.upsert({
      where: { id: pronostics.indexOf(prono) + 1 },
      update: {},
      create: prono,
    }).catch(() => prisma.pronostic.create({ data: prono }));
  }
  console.log('[SEED] 8 pronostics created');
}

main()
  .catch(e => {
    console.error('[SEED] Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
