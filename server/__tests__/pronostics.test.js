const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../index');

const mockPronostic = {
  id: 1, fixtureId: 123, homeTeam: 'PSG', awayTeam: 'OM',
  prediction: 'PSG gagne', result: null, confidence: 80,
  league: 'Ligue 1', matchDate: new Date().toISOString(), userId: 1,
};

jest.mock('../services/prismaClient', () => ({
  pronostic: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 1, ...{} }),
    count: jest.fn().mockResolvedValue(0),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue({ id: 1, email: 'admin@kickzone.fr', role: 'ADMIN' }),
  },
  article: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({}),
  },
}));

const makeAdminToken = () =>
  jwt.sign({ id: 1, email: 'admin@kickzone.fr', role: 'ADMIN' }, process.env.JWT_SECRET || 'kickzone_jwt_secret_very_long_random_string_2026');

describe('Pronostics API', () => {
  it('GET /api/pronostics → 200 + array', async () => {
    const res = await request(app).get('/api/pronostics');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/pronostics sans JWT → 401', async () => {
    const res = await request(app).post('/api/pronostics').send({});
    expect(res.status).toBe(401);
  });

  it('POST /api/pronostics avec JWT admin + data valide → 201', async () => {
    const prisma = require('../services/prismaClient');
    prisma.pronostic.create.mockResolvedValueOnce({ id: 2, ...mockPronostic });

    const token = makeAdminToken();
    const res = await request(app)
      .post('/api/pronostics')
      .set('Authorization', `Bearer ${token}`)
      .send(mockPronostic);
    expect(res.status).toBe(201);
  });
});
