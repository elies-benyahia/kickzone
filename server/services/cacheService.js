const cache = new Map();

const TTL = {
  LIVE: 60,
  PLAYERS: 5 * 60,
  FIXTURES: 5 * 60,
  STANDINGS: 30 * 60,
  H2H: 60 * 60,
  LINEUPS: 60 * 60,
  TRANSFERS: 2 * 60 * 60,
  DEFAULT: 5 * 60,
};

const getFromCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setInCache = (key, data, ttlSeconds = TTL.DEFAULT) => {
  cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
};

const clearCache = () => cache.clear();

const getCacheStats = () => ({
  size: cache.size,
  keys: [...cache.keys()],
});

module.exports = { getFromCache, setInCache, clearCache, getCacheStats, TTL };
