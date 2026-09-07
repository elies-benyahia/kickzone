// ============================================================================
//  services/cacheService.js — petit cache en mémoire
//  But : éviter de rappeler l'API-Football à chaque visite. Une réponse est
//  gardée 5 minutes, puis considérée périmée.
//  Le cache vit dans la mémoire du serveur : il est vidé à chaque redémarrage.
// ============================================================================

const cache = new Map();                // clé (string) -> { data, expiresAt }
const TTL_MS = 5 * 60 * 1000;           // durée de vie d'une entrée : 5 minutes

// Renvoie la valeur si elle existe ET n'est pas périmée, sinon null.
const getFromCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {   // périmée -> on la jette
    cache.delete(key);
    return null;
  }
  return entry.data;
};

// Stocke une valeur avec sa date d'expiration.
const setInCache = (key, data) => {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
};

// Vide tout le cache (utilisé par les tests).
const clearCache = () => cache.clear();

module.exports = { getFromCache, setInCache, clearCache };
