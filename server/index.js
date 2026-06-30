require('dotenv').config();
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

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`KickZone API listening on port ${PORT}`));

module.exports = app;
