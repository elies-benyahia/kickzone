// Contenus statiques de la page d'accueil.

// Encart "derniers deals" de la barre latérale droite.
export const SIDEBAR_DEALS = [
  { player: 'Enzo Fernández', from: 'Chelsea', to: 'Man City', fee: '145M€', official: true },
  { player: 'Yan Diomandé', from: 'Leipzig', to: 'Real Madrid', fee: '130M€', official: true },
  { player: 'Bradley Barcola', from: 'PSG', to: 'Liverpool', fee: '125M€', official: true },
  { player: 'Bruno Guimarães', from: 'Newcastle', to: 'Arsenal', fee: '85M€', official: true },
  { player: 'Rodri', from: 'Man City', to: 'Barcelone', fee: '75M€', official: true },
  { player: 'Anthony Gordon', from: 'Newcastle', to: 'Barcelone', fee: '70M€', official: true },
  { player: 'Rafael Leão', from: 'AC Milan', to: 'PSG', fee: '~90M€', official: false },
];

// Articles affichés si aucun flux RSS n'est disponible.
export const FALLBACK_ARTICLES = [
  { id: 'f1', title: 'Ligue des Champions : soirée européenne pleine de promesses pour les clubs français', link: 'https://www.lequipe.fr', sourceName: "L'Équipe", imageUrl: null, publishedAt: new Date() },
  { id: 'f2', title: "Mercato : les plus gros transferts de l'été 2026 décryptés", link: 'https://www.footmercato.net', sourceName: 'Foot Mercato', imageUrl: null, publishedAt: new Date() },
  { id: 'f3', title: 'Ligue 1 : le point sur la course au titre à l\'approche de l\'automne', link: 'https://rmcsport.bfmtv.com', sourceName: 'RMC Sport', imageUrl: null, publishedAt: new Date() },
  { id: 'f4', title: 'Champions League 2026-27 : le calendrier de la phase de ligue dévoilé', link: 'https://www.eurosport.fr', sourceName: 'Eurosport', imageUrl: null, publishedAt: new Date() },
];
