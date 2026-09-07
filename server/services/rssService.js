const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 5000,
  headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/rss+xml, application/xml, text/xml, */*' },
  customFields: { item: [['media:content', 'media:content'], ['media:thumbnail', 'media:thumbnail']] },
});

const FEEDS = [
  { name: 'Foot Mercato', url: 'https://www.footmercato.net/feed/', logo: 'https://www.footmercato.net/bundles/websiteV2/img/favicon/apple-icon-180x180.png' },
  { name: "L'Équipe", url: 'https://www.lequipe.fr/rss/actu_rss_Foot.xml', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/3a/L%27Equipe_logo.svg/200px-L%27Equipe_logo.svg.png' },
  { name: 'RMC Sport', url: 'https://rmcsport.bfmtv.com/rss/football/', logo: '' },
  { name: 'Eurosport', url: 'https://www.eurosport.fr/football/rss.xml', logo: '' },
  { name: 'But Football', url: 'https://www.butfootballclub.fr/feed/', logo: '' },
  { name: 'Le10Sport', url: 'https://www.le10sport.com/rss/foot.xml', logo: '' },
];

const TRANSFER_KEYWORDS = [
  'transfert', 'mercato', 'recrute', 'signe', 'officiel', 'prêt', 'vente', 'accord',
  'négocie', 'piste', 'intérêt', 'prolonge', 'contrat', 'transfer', 'sign', 'loan', 'deal', 'fee', 'million',
];

const imageOf = (item) =>
  item.enclosure?.url ||
  item['media:content']?.$?.url ||
  item['media:thumbnail']?.$?.url ||
  null;

const textOf = (item) =>
  item.contentSnippet?.slice(0, 200) ||
  item.content?.replace(/<[^>]+>/g, '').slice(0, 200) ||
  '';

// Charge tous les flux une fois, avec un cache de 10 minutes.
let cache = null;
let cacheTs = 0;

const loadFeeds = async () => {
  if (cache && Date.now() - cacheTs < 10 * 60 * 1000) return cache;

  const results = await Promise.allSettled(FEEDS.map((feed) => parser.parseURL(feed.url).then((p) => ({ feed, items: p.items || [] }))));

  const items = [];
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    const { feed, items: feedItems } = r.value;
    feedItems.slice(0, 15).forEach((item) => {
      if (!item.title) return;
      items.push({
        id: item.guid || item.link || `${feed.name}-${item.title}`,
        title: item.title,
        link: item.link || item.guid || '',
        summary: textOf(item),
        date: item.pubDate || item.isoDate || new Date().toISOString(),
        source: feed.name,
        sourceLogo: feed.logo,
        image: imageOf(item),
      });
    });
  }

  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  cache = items;
  cacheTs = Date.now();
  console.log(`[RSS] ${items.length} articles chargés`);
  return items;
};

// Toutes les actus, au format attendu par la page Actu / l'accueil.
const fetchAllArticles = async () => {
  const items = await loadFeeds();
  return items.map((it) => ({
    id: it.id,
    title: it.title,
    link: it.link,
    summary: it.summary,
    publishedAt: new Date(it.date),
    sourceName: it.source,
    sourceLogo: it.sourceLogo,
    imageUrl: it.image,
  }));
};

// Uniquement les actus mercato (filtre par mots-clés).
const fetchTransferNews = async () => {
  const items = await loadFeeds();
  return items
    .filter((it) => {
      const text = `${it.title} ${it.summary}`.toLowerCase();
      return TRANSFER_KEYWORDS.some((kw) => text.includes(kw));
    })
    .slice(0, 40);
};

module.exports = { fetchAllArticles, fetchTransferNews };
