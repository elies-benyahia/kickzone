// Petit cache en mémoire : une valeur expire au bout de 5 minutes.
const cache = new Map();
const TTL_MS = 5 * 60 * 1000;

const getFromCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setInCache = (key, data) => {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
};

const clearCache = () => cache.clear();

module.exports = { getFromCache, setInCache, clearCache };
