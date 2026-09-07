// ============================================================================
//  index.js — point d'entrée du serveur KickZone
//  Rôle : créer l'application Express, brancher la sécurité, les routes de
//  l'API, servir le site en production, et démarrer l'écoute réseau.
// ============================================================================

// Charge les variables d'environnement du fichier server/.env dans process.env
// (PORT, JWT_SECRET, FOOTBALL_API_KEY, etc.). Le chemin est calculé à partir
// de __dirname pour fonctionner quel que soit le dossier d'où on lance node.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const path = require('path');        // utilitaire Node pour construire des chemins de fichiers
const fs = require('fs');            // accès au système de fichiers (vérifier l'existence de client/dist)
const express = require('express');  // framework web qui gère les routes HTTP
const cors = require('cors');        // autorise le navigateur du front à appeler l'API (règles CORS)
const helmet = require('helmet');    // ajoute des en-têtes HTTP de sécurité
const rateLimit = require('express-rate-limit'); // limite le nombre de requêtes par IP (anti-abus)

const app = express();               // crée l'application Express

// --- Sécurité --------------------------------------------------------------

// Helmet pose des en-têtes de sécurité (X-Frame-Options, etc.).
// contentSecurityPolicy désactivée pour ne pas bloquer les images/API externes.
app.use(helmet({ contentSecurityPolicy: false }));

// CORS : seules les origines listées dans ALLOWED_ORIGINS ont le droit d'appeler l'API.
// En dev c'est http://localhost:5173 (le serveur Vite du front).
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  credentials: true, // autorise l'envoi du header Authorization
}));

// Analyse automatiquement le corps JSON des requêtes (limite 2 Mo pour les articles).
app.use(express.json({ limit: '2mb' }));

// --- Limitation du débit (rate limiting) ---------------------------------

// Toute l'API : maximum 200 requêtes par minute et par IP.
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));
// Connexion : maximum 10 tentatives par tranche de 15 minutes (protection anti-force brute).
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));

// --- Routes de l'API -----------------------------------------------------
// Chaque préfixe d'URL est délégué à un fichier de routes dédié.
app.use('/api/articles',   require('./routes/articles'));    // articles (CRUD + recherche)
app.use('/api/football',   require('./routes/football'));    // données football (proxy API-Football + RSS)
app.use('/api/pronostics', require('./routes/pronostics'));  // pronostics des utilisateurs
app.use('/api/auth',       require('./routes/auth'));        // inscription / connexion / profil
app.use('/api/news',       require('./routes/news'));        // actualités agrégées depuis les flux RSS

// Route de test : permet de vérifier que l'API répond ("GET /api/health").
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'KickZone API', ts: new Date().toISOString() }));

// --- Front-end en production -------------------------------------------
// Si le build React existe (client/dist), le même serveur le sert :
// un seul serveur, un seul port, pas besoin de nginx.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist)); // sert les fichiers statiques (js, css, images)
  // Toute URL qui n'est pas /api renvoie index.html : c'est React (React Router)
  // qui décide ensuite quelle page afficher.
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// --- Gestion centralisée des erreurs ---------------------------------
// Tout appel à next(err) dans une route arrive ici. On renvoie un JSON
// { error: ... } avec le bon code HTTP (par défaut 500).
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

// --- Démarrage du serveur -------------------------------------------
const PORT = process.env.PORT || 3001; // port d'écoute (3001 par défaut)
app.listen(PORT, async () => {
  console.log(`KickZone API listening on port ${PORT}`);
  if (process.env.NODE_ENV === 'test') return; // en test, on ne remplit pas la base
  try {
    // Au premier démarrage, si la base est vide, on la remplit automatiquement
    // (utile en ligne où le fichier SQLite repart de zéro à chaque déploiement).
    await require('./database/seed').seedIfEmpty();
  } catch (e) {
    console.error('[BOOT] seed auto échoué :', e.message);
  }
});

module.exports = app; // exporté pour les tests (supertest importe `app` sans démarrer le réseau)
