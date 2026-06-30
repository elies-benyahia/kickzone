const request = require('supertest');

// Mock du pool mysql2 — doit être déclaré avant require('../index')
jest.mock('../config/db', () => ({
  execute: jest.fn(),
}));

const pool = require('../config/db');
const app  = require('../index');

// Données de test
const MOCK_ARTICLE = {
  id: 1, slug: 'test-article', title: 'Test Article', summary: 'Résumé test',
  imageUrl: null, category: 'ACTU', author: 'Auteur', views: 0,
  publishedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
};

beforeEach(() => {
  pool.execute.mockReset();
});

describe('Articles API — GET /api/articles', () => {
  it('retourne 200 avec la structure { data, meta }', async () => {
    pool.execute
      .mockResolvedValueOnce([[MOCK_ARTICLE], []])          // SELECT articles
      .mockResolvedValueOnce([[{ total: 1 }], []]);         // SELECT COUNT

    const res = await request(app).get('/api/articles');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('total');
  });

  it('filtre par catégorie TRANSFERT', async () => {
    const transfert = { ...MOCK_ARTICLE, category: 'TRANSFERT', slug: 'transfert-test' };
    pool.execute
      .mockResolvedValueOnce([[transfert], []])
      .mockResolvedValueOnce([[{ total: 1 }], []]);

    const res = await request(app).get('/api/articles?category=TRANSFERT');
    expect(res.status).toBe(200);
    expect(res.body.data[0].category).toBe('TRANSFERT');
  });
});

describe('Articles API — GET /api/articles/:slug', () => {
  it('retourne 404 pour un slug inexistant', async () => {
    pool.execute.mockResolvedValueOnce([[], []]);  // findUnique → null

    const res = await request(app).get('/api/articles/slug-inexistant');
    expect(res.status).toBe(404);
  });

  it('retourne 401 sur POST sans JWT', async () => {
    const res = await request(app)
      .post('/api/articles')
      .send({ title: 'Test', category: 'ACTU' });
    expect(res.status).toBe(401);
  });
});

describe('articleService.slugify', () => {
  const { slugify } = require('../services/articleService');

  it('transforme correctement une chaîne française', () => {
    expect(slugify('Mon Article Foot!')).toBe('mon-article-foot');
  });

  it('gère les espaces et caractères spéciaux', () => {
    expect(slugify('PSG vs Manchester City')).toBe('psg-vs-manchester-city');
  });
});
