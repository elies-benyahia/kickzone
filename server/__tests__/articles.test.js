const request = require('supertest');
const app = require('../index');

jest.mock('../services/prismaClient', () => ({
  article: {
    findMany: jest.fn().mockResolvedValue([
      { id: 1, slug: 'test-article', title: 'Test', category: 'ACTU', publishedAt: new Date(), views: 0 }
    ]),
    count: jest.fn().mockResolvedValue(1),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({}),
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

  it('GET /api/articles?category=TRANSFERT → filtre appliqué', async () => {
    const prisma = require('../services/prismaClient');
    prisma.article.findMany.mockResolvedValueOnce([
      { id: 2, slug: 'transfert-test', title: 'Transfert', category: 'TRANSFERT', publishedAt: new Date(), views: 0 }
    ]);
    prisma.article.count.mockResolvedValueOnce(1);
    const res = await request(app).get('/api/articles?category=TRANSFERT');
    expect(res.status).toBe(200);
    expect(res.body.data[0].category).toBe('TRANSFERT');
  });
});

describe('articleService.slugify', () => {
  const { slugify } = require('../services/articleService');
  it('slugify("Mon Article Foot!") → "mon-article-foot"', () => {
    expect(slugify('Mon Article Foot!')).toBe('mon-article-foot');
  });
});
