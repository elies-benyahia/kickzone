const request = require('supertest');
const bcrypt = require('bcryptjs');

jest.mock('../services/prismaClient', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  article: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({}),
  },
  pronostic: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  },
}));

const app = require('../index');

describe('Auth API', () => {
  it('POST /api/auth/login mauvais password → 401', async () => {
    const prisma = require('../services/prismaClient');
    const hash = await bcrypt.hash('CorrectPass1!', 10);
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 1, email: 'admin@kickzone.fr', password: hash, role: 'ADMIN',
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@kickzone.fr', password: 'WrongPass!' });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login bon password → 200 + token', async () => {
    const prisma = require('../services/prismaClient');
    const hash = await bcrypt.hash('Admin2024!', 10);
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 1, email: 'admin@kickzone.fr', password: hash, role: 'ADMIN',
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@kickzone.fr', password: 'Admin2024!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
