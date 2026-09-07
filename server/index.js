require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));

// Routes
app.use('/api/articles',   require('./routes/articles'));
app.use('/api/football',   require('./routes/football'));
app.use('/api/pronostics', require('./routes/pronostics'));
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/news',       require('./routes/news'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'KickZone API', ts: new Date().toISOString() }));

// En production, le serveur sert aussi le build du front (client/dist).
// Un seul serveur, un seul port : plus besoin de nginx.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Toute route non-API renvoie index.html (routing géré côté React)
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`KickZone API listening on port ${PORT}`);
  if (process.env.NODE_ENV === 'test') return;
  try {
    await require('./database/seed').seedIfEmpty();
  } catch (e) {
    console.error('[BOOT] seed auto échoué :', e.message);
  }
});

module.exports = app;
