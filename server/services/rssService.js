const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KickZone/1.0)' },
  customFields: { item: [['media:content', 'media:content'], ['media:thumbnail', 'media:thumbnail']] },
});

const FEEDS = [
  { name: 'Foot Mercato',  url: 'https://www.footmercato.net/feed/', logo: 'https://www.footmercato.net/bundles/websiteV2/img/favicon/apple-icon-180x180.png' },
  { name: "L'Équipe",      url: 'https://www.lequipe.fr/rss/actu_rss_Foot.xml', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/3a/L%27Equipe_logo.svg/200px-L%27Equipe_logo.svg.png' },
  { name: 'RMC Sport',     url: 'https://rmcsport.bfmtv.com/rss/football/', logo: '' },
  { name: 'Eurosport',     url: 'https://www.eurosport.fr/football/rss.xml', logo: '' },
  { name: 'But Football',  url: 'https://www.butfootballclub.fr/feed/', logo: '' },
  { name: 'Le10Sport',     url: 'https://www.le10sport.com/rss/foot.xml', logo: '' },
];

const extractImage = (item) => {
  if (item.enclosure?.url) return item.enclosure.url;
  const mc = item['media:content'];
  if (mc && mc.$ && mc.$.url) return mc.$.url;
  if (mc && mc.url) return mc.url;
  const mt = item['media:thumbnail'];
  if (mt && mt.$ && mt.$.url) return mt.$.url;
  return null;
};

let _allCache = null;
let _allCacheTs = 0;

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

const fetchAllArticles = async () => {
  const now = Date.now();
  if (_allCache && now - _allCacheTs < CACHE_TTL) return _allCache;

  const all = [];
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return { feed, items: parsed.items || [] };
    })
  );

  for (const res of results) {
    if (res.status !== 'fulfilled') continue;
    const { feed, items } = res.value;
    items.slice(0, 10).forEach((item) => {
      all.push({
        id: item.guid || item.link || `${feed.name}-${item.title}`,
        title: item.title || '',
        link: item.link || item.guid || '',
        summary: item.contentSnippet?.slice(0, 200) || '',
        publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
        sourceName: feed.name,
        sourceLogo: feed.logo || '',
        imageUrl: extractImage(item),
      });
    });
  }

  const sorted = all.sort((a, b) => b.publishedAt - a.publishedAt);
  _allCache = sorted;
  _allCacheTs = now;
  console.log(`[RSS] Fetched ${sorted.length} total articles from ${FEEDS.length} feeds`);
  return sorted;
};

module.exports = { fetchTransferNews, fetchAllArticles };
