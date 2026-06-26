const request = require('supertest');
const app = require('../index');

jest.mock('../services/prismaClient', () => ({
  article: {
    findMany: jest.fn().mockResolvedValue([
      { id: 1, slug: 'test-article', title: 'Test', category: 'ACTU', publishedAt: new Date() }
    ]),
    count: jest.fn().mockResolvedValue(1),
    findUnique: jest.fn().mockResolvedValue(null),
  },
}));

describe('Articles API', () => {
  it('GET /api/articles → 200 + structure {data, meta}', async () => {
    const res = await request(app).get('/api/articles');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /api/articles/slug-inexistant → 404', async () => {
    const res = await request(app).get('/api/articles/slug-inexistant');
    expect(res.status).toBe(404);
  });

  it('POST /api/articles sans JWT → 401', async () => {
    const res = await request(app).post('/api/articles').send({ title: 'Test', category: 'ACTU' });
    expect(res.status).toBe(401);
  });
});

describe('articleService.slugify', () => {
  const { slugify } = require('../services/articleService');
  it('slugify("Mon Article Foot!") → "mon-article-foot"', () => {
    expect(slugify('Mon Article Foot!')).toBe('mon-article-foot');
  });
});
