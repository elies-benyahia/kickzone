const request = require('supertest');
const bcrypt  = require('bcryptjs');

// Mock du pool mysql2 — déclaré avant require('../index')
jest.mock('../config/db', () => ({
  execute: jest.fn(),
}));

const pool = require('../config/db');
const app  = require('../index');

beforeEach(() => {
  pool.execute.mockReset();
});

describe('Auth API — POST /api/auth/login', () => {
  it('retourne 401 avec un mauvais mot de passe', async () => {
    const hash = await bcrypt.hash('CorrectPass1!', 10);
    // SELECT user par email
    pool.execute.mockResolvedValueOnce([[
      { id: 1, email: 'admin@kickzone.fr', password: hash, role: 'ADMIN' }
    ], []]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@kickzone.fr', password: 'WrongPass!' });

    expect(res.status).toBe(401);
  });

  it('retourne 200 + token avec le bon mot de passe', async () => {
    const hash = await bcrypt.hash('Admin2024!', 10);
    pool.execute.mockResolvedValueOnce([[
      { id: 1, email: 'admin@kickzone.fr', password: hash, role: 'ADMIN' }
    ], []]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@kickzone.fr', password: 'Admin2024!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('ADMIN');
  });

  it('retourne 401 si l\'utilisateur n\'existe pas', async () => {
    pool.execute.mockResolvedValueOnce([[], []]);  // user introuvable

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@test.fr', password: 'test' });

    expect(res.status).toBe(401);
  });
});
