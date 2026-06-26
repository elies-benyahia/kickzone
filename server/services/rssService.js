const Parser = require('rss-parser');
const parser = new Parser({ timeout: 8000 });

const FEEDS = [
  { name: 'Foot Mercato',  url: 'https://www.footmercato.net/feed/' },
  { name: "L'Équipe",      url: 'https://www.lequipe.fr/rss/actu_rss.xml' },
  { name: 'RMC Sport',     url: 'https://rmcsport.bfmtv.com/rss/football/' },
  { name: 'Eurosport',     url: 'https://www.eurosport.fr/football/rss.xml' },
];

const TRANSFER_KEYWORDS = [
  'transfert', 'mercato', 'recrute', 'signe', 'officiel', 'prêt', 'vente',
  'accord', 'négocie', 'piste', 'intérêt', 'prolonge', 'contrat',
  'transfer', 'sign', 'loan', 'deal', 'fee', 'million',
];

let cache = null;
let cacheTs = 0;
const CACHE_TTL = 10 * 60 * 1000;

const fetchTransferNews = async () => {
  if (cache && Date.now() - cacheTs < CACHE_TTL) return cache;

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items.map(item => ({
          source: feed.name,
          title: item.title || '',
          summary: item.contentSnippet?.slice(0, 200) || item.content?.slice(0, 200) || '',
          link: item.link || '',
          date: item.pubDate || item.isoDate || new Date().toISOString(),
          image: item.enclosure?.url || null,
        }));
      } catch (e) {
        console.warn(`[RSS] Failed to fetch ${feed.name}: ${e.message}`);
        return [];
      }
    })
  );

  const allItems = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(item => {
      const text = (item.title + ' ' + item.summary).toLowerCase();
      return TRANSFER_KEYWORDS.some(kw => text.includes(kw));
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 40);

  cache = allItems;
  cacheTs = Date.now();
  console.log(`[RSS] ${new Date().toISOString()} Fetched ${allItems.length} transfer news items`);
  return allItems;
};

module.exports = { fetchTransferNews };
