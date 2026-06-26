const request = require('supertest');
jest.mock('axios');
const axios = require('axios');

axios.get.mockResolvedValue({ data: { response: [] } });

const app = require('../index');

describe('Football API (proxy)', () => {
  it('GET /api/football/fixtures/today → 200', async () => {
    const res = await request(app).get('/api/football/fixtures/today');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/football/standings/61 → 200', async () => {
    const res = await request(app).get('/api/football/standings/61');
    expect(res.status).toBe(200);
  });
});
