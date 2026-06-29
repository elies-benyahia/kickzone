import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('kz_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export { api };

// Helpers
const isLive = (status) => ['1H','2H','HT','ET','P','LIVE','INT'].includes(status);
const isFinished = (status) => ['FT','AET','PEN','AWD','WO'].includes(status);

const getRefetchInterval = (fixture) => {
  if (!fixture) return false;
  const status = fixture?.fixture?.status?.short;
  if (isLive(status)) return 60 * 1000;
  if (isFinished(status)) return false;
  return 5 * 60 * 1000;
};

// Football hooks
export const useFixturesToday = () =>
  useQuery({
    queryKey: ['fixtures-today'],
    queryFn: () => api.get('/football/fixtures/today').then(r => r.data),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

export const useFixturesByDate = (date) =>
  useQuery({
    queryKey: ['fixtures-date', date],
    queryFn: () => api.get(`/football/fixtures/date/${date}`).then(r => r.data),
    enabled: !!date,
    staleTime: 2 * 60 * 1000,
  });

export const useFixture = (id) =>
  useQuery({
    queryKey: ['fixture', id],
    queryFn: () => api.get(`/football/fixtures/${id}`).then(r => r.data),
    enabled: !!id,
    refetchInterval: (data) => {
      const fixture = Array.isArray(data) ? data[0] : data;
      return getRefetchInterval(fixture);
    },
  });

export const useFixtureEvents = (id) =>
  useQuery({
    queryKey: ['fixture-events', id],
    queryFn: () => api.get(`/football/fixtures/${id}/events`).then(r => r.data),
    enabled: !!id,
    refetchInterval: 60 * 1000,
  });

export const useLineups = (id) =>
  useQuery({
    queryKey: ['lineups', id],
    queryFn: () => api.get(`/football/fixtures/${id}/lineups`).then(r => r.data),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });

export const useFixtureStats = (id) =>
  useQuery({
    queryKey: ['fixture-stats', id],
    queryFn: () => api.get(`/football/fixtures/${id}/stats`).then(r => r.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

export const useH2H = (t1, t2) =>
  useQuery({
    queryKey: ['h2h', t1, t2],
    queryFn: () => api.get(`/football/h2h/${t1}/${t2}`).then(r => r.data),
    enabled: !!(t1 && t2),
    staleTime: 60 * 60 * 1000,
  });

export const useStandings = (leagueId) =>
  useQuery({
    queryKey: ['standings', leagueId],
    queryFn: () => api.get(`/football/standings/${leagueId}`).then(r => r.data),
    staleTime: 30 * 60 * 1000,
    enabled: !!leagueId,
  });

export const useLatestTransfers = () =>
  useQuery({
    queryKey: ['transfers-latest'],
    queryFn: () => api.get('/football/transfers/latest').then(r => r.data),
    staleTime: 2 * 60 * 60 * 1000,
  });

export const useTeam = (id) =>
  useQuery({
    queryKey: ['team', id],
    queryFn: () => api.get(`/football/teams/${id}`).then(r => r.data),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });

export const useTeamStats = (id, league = 61) =>
  useQuery({
    queryKey: ['team-stats', id, league],
    queryFn: () => api.get(`/football/teams/${id}/statistics`, { params: { league } }).then(r => r.data),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });

export const useTeamSquad = (id) =>
  useQuery({
    queryKey: ['team-squad', id],
    queryFn: () => api.get(`/football/teams/${id}/squad`).then(r => r.data),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });

export const useSearch = (q) =>
  useQuery({
    queryKey: ['search', q],
    queryFn: () => api.get('/football/search', { params: { q } }).then(r => r.data),
    enabled: q?.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

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
  useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.get(`/articles/${slug}`).then(r => r.data),
    enabled: !!slug,
  });

export const useCreateArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/articles', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['articles'] }),
  });
};

// Pronostics hook
export const usePronostics = () =>
  useQuery({ queryKey: ['pronostics'], queryFn: () => api.get('/pronostics').then(r => r.data) });

export const useCreatePronostic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/pronostics', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pronostics'] }),
  });
};

export const useTransferNews = () =>
  useQuery({
    queryKey: ['transfer-news'],
    queryFn: () => api.get('/football/transfers/news').then(r => r.data),
    staleTime: 10 * 60 * 1000,
  });

export const usePlayerSearch = (query) =>
  useQuery({
    queryKey: ['player-search', query],
    queryFn: () => api.get('/football/players/search', { params: { q: query } }).then(r => r.data),
    enabled: query?.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

export const usePlayer = (id) =>
  useQuery({
    queryKey: ['player', id],
    queryFn: () => api.get(`/football/players/${id}`).then(r => r.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
