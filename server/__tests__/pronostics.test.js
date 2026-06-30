const request = require('supertest');
const jwt     = require('jsonwebtoken');

// Mock du pool mysql2 — déclaré avant require('../index')
jest.mock('../config/db', () => ({
  execute: jest.fn(),
}));

const pool = require('../config/db');
const app  = require('../index');

const JWT_SECRET = process.env.JWT_SECRET || 'kickzone_jwt_secret_very_long_random_string_2026';

const makeAdminToken = () =>
  jwt.sign({ id: 1, email: 'admin@kickzone.fr', role: 'ADMIN' }, JWT_SECRET);

const MOCK_PRONO = {
  id: 1, fixtureId: 123, homeTeam: 'France', awayTeam: 'Brésil',
  homeTeamId: 2, awayTeamId: 6,
  prediction: 'France gagne 2-1', result: 'EN_ATTENTE',
  confidence: 70, league: 'World Cup', matchDate: new Date().toISOString(),
  userId: 1, userEmail: 'admin@kickzone.fr',
};

beforeEach(() => {
  pool.execute.mockReset();
});

describe('Pronostics API', () => {
  it('GET /api/pronostics → 200 + tableau', async () => {
    pool.execute.mockResolvedValueOnce([[MOCK_PRONO], []]);

    const res = await request(app).get('/api/pronostics');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/pronostics sans JWT → 401', async () => {
    const res = await request(app)
      .post('/api/pronostics')
      .send({});
    expect(res.status).toBe(401);
  });

  it('POST /api/pronostics avec JWT admin et données valides → 201', async () => {
    // INSERT → insertId
    pool.execute.mockResolvedValueOnce([{ insertId: 2 }, []]);

    const res = await request(app)
      .post('/api/pronostics')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({
        fixtureId: 999, homeTeam: 'PSG', awayTeam: 'OM',
        prediction: 'PSG gagne', confidence: 75,
        league: 'Ligue 1', matchDate: new Date().toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
