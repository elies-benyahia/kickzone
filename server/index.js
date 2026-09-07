// index.js — crée le serveur Express, branche sécurité + routes, sert le front en prod, démarre l'écoute.

require('dotenv').config({ path: require('path').join(__dirname, '.env') }); // charge server/.env
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// --- Sécurité ---
app.use(helmet({ contentSecurityPolicy: false }));          // en-têtes HTTP de sécurité
app.use(cors({ origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','), credentials: true }));
app.use(express.json({ limit: '2mb' }));                    // parse le corps JSON des requêtes

// --- Anti-abus : limite de requêtes par IP ---
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 200 }));            // 200 req / minute
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })); // 10 tentatives / 15 min

// --- Routes de l'API (un fichier par domaine) ---
app.use('/api/articles',   require('./routes/articles'));
app.use('/api/football',   require('./routes/football'));
app.use('/api/pronostics', require('./routes/pronostics'));
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/news',       require('./routes/news'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' })); // test : l'API répond ?

// --- En prod, le même serveur sert le build React (client/dist) ---
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html'))); // routing géré par React
}

// --- Gestion centralisée des erreurs (tout next(err) arrive ici) ---
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`KickZone API listening on port ${PORT}`);
  if (process.env.NODE_ENV === 'test') return;
  try { await require('./database/seed').seedIfEmpty(); } // remplit la base si elle est vide
  catch (e) { console.error('[BOOT] seed auto échoué :', e.message); }
});

module.exports = app; // pour les tests
