const request = require('supertest');
const app = require('../index');

jest.mock('../services/prismaClient', () => ({
  pronostic: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
}));

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
});
