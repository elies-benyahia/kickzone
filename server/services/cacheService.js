// services/cacheService.js — cache en mémoire (5 min) pour éviter de rappeler l'API-Football.

const cache = new Map();               // clé -> { data, expiresAt }
const TTL_MS = 5 * 60 * 1000;

const getFromCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; } // périmé
  return entry.data;
};

const setInCache = (key, data) => cache.set(key, { data, expiresAt: Date.now() + TTL_MS });

const clearCache = () => cache.clear(); // utilisé par les tests

module.exports = { getFromCache, setInCache, clearCache };
