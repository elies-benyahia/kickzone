import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('kz_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export { api };

// Football hooks
export const useFixturesToday = () =>
  useQuery({ queryKey: ['fixtures-today'], queryFn: () => api.get('/football/fixtures/today').then(r => r.data), staleTime: 3 * 60 * 1000 });

export const useFixturesByDate = (date) =>
  useQuery({ queryKey: ['fixtures-date', date], queryFn: () => api.get(`/football/fixtures/date/${date}`).then(r => r.data), enabled: !!date });

export const useFixture = (id) =>
  useQuery({ queryKey: ['fixture', id], queryFn: () => api.get(`/football/fixtures/${id}`).then(r => r.data), enabled: !!id });

export const useLineups = (id) =>
  useQuery({ queryKey: ['lineups', id], queryFn: () => api.get(`/football/fixtures/${id}/lineups`).then(r => r.data), enabled: !!id });

export const useFixtureStats = (id) =>
  useQuery({ queryKey: ['fixture-stats', id], queryFn: () => api.get(`/football/fixtures/${id}/stats`).then(r => r.data), enabled: !!id });

export const useH2H = (t1, t2) =>
  useQuery({ queryKey: ['h2h', t1, t2], queryFn: () => api.get(`/football/h2h/${t1}/${t2}`).then(r => r.data), enabled: !!(t1 && t2) });

export const useStandings = (leagueId) =>
  useQuery({ queryKey: ['standings', leagueId], queryFn: () => api.get(`/football/standings/${leagueId}`).then(r => r.data), staleTime: 30 * 60 * 1000 });

export const useLatestTransfers = () =>
  useQuery({ queryKey: ['transfers-latest'], queryFn: () => api.get('/football/transfers/latest').then(r => r.data), staleTime: 10 * 60 * 1000 });

// Articles hooks
export const useArticles = (params = {}) => {
  const { category, page = 1, limit = 20 } = params;
  return useQuery({
    queryKey: ['articles', category, page, limit],
    queryFn: () => api.get('/articles', { params: { category, page, limit } }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useArticle = (slug) =>
  useQuery({ queryKey: ['article', slug], queryFn: () => api.get(`/articles/${slug}`).then(r => r.data), enabled: !!slug });

// Pronostics hook
export const usePronostics = () =>
  useQuery({ queryKey: ['pronostics'], queryFn: () => api.get('/pronostics').then(r => r.data) });
