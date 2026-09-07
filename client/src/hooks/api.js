import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Un seul client HTTP pour toute l'appli. Le token JWT est ajouté automatiquement.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('kz_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Raccourci : GET qui renvoie directement les données.
const get = (url, params) => api.get(url, { params }).then((r) => r.data);

export { api };

const MIN = 60 * 1000;

// Un match "en direct" est rafraîchi chaque minute, un match terminé ne l'est plus.
const LIVE = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'INT'];
const refetchLive = (data) => {
  const fixture = Array.isArray(data) ? data[0] : data;
  const status = fixture?.fixture?.status?.short;
  return LIVE.includes(status) ? MIN : false;
};

/* ─── Football ─────────────────────────────────────────────── */
export const useFixturesToday = () =>
  useQuery({ queryKey: ['fixtures-today'], queryFn: () => get('/football/fixtures/today'), refetchInterval: MIN });

export const useFixturesByDate = (date) =>
  useQuery({ queryKey: ['fixtures', date], queryFn: () => get(`/football/fixtures/date/${date}`), enabled: !!date });

export const useFixture = (id) =>
  useQuery({ queryKey: ['fixture', id], queryFn: () => get(`/football/fixtures/${id}`), enabled: !!id, refetchInterval: refetchLive });

export const useFixtureEvents = (id) =>
  useQuery({ queryKey: ['events', id], queryFn: () => get(`/football/fixtures/${id}/events`), enabled: !!id, refetchInterval: MIN });

export const useLineups = (id) =>
  useQuery({ queryKey: ['lineups', id], queryFn: () => get(`/football/fixtures/${id}/lineups`), enabled: !!id });

export const useFixtureStats = (id) =>
  useQuery({ queryKey: ['stats', id], queryFn: () => get(`/football/fixtures/${id}/stats`), enabled: !!id });

export const useH2H = (t1, t2) =>
  useQuery({ queryKey: ['h2h', t1, t2], queryFn: () => get(`/football/h2h/${t1}/${t2}`), enabled: !!(t1 && t2) });

export const useStandings = (league) =>
  useQuery({ queryKey: ['standings', league], queryFn: () => get(`/football/standings/${league}`), enabled: !!league });

export const useTeam = (id) =>
  useQuery({ queryKey: ['team', id], queryFn: () => get(`/football/teams/${id}`), enabled: !!id });

export const useTeamStats = (id, league = 61) =>
  useQuery({ queryKey: ['team-stats', id, league], queryFn: () => get(`/football/teams/${id}/statistics`, { league }), enabled: !!id });

export const useTeamSquad = (id) =>
  useQuery({ queryKey: ['squad', id], queryFn: () => get(`/football/teams/${id}/squad`), enabled: !!id });

export const useSearch = (q) =>
  useQuery({
    queryKey: ['search', q],
    enabled: q?.length >= 2,
    queryFn: async () => {
      const [football, articles] = await Promise.allSettled([
        get('/football/search', { q }),
        get('/articles/search', { q }),
      ]);
      return {
        players: football.value?.players ?? [],
        teams: football.value?.teams ?? [],
        articles: articles.value ?? [],
      };
    },
  });

export const usePlayerSearch = (q) =>
  useQuery({ queryKey: ['player-search', q], queryFn: () => get('/football/players/search', { q }), enabled: q?.length >= 2 });

export const usePlayer = (id) =>
  useQuery({ queryKey: ['player', id], queryFn: () => get(`/football/players/${id}`), enabled: !!id });

/* ─── Articles ─────────────────────────────────────────────── */
export const useArticles = ({ category, page = 1, limit = 20 } = {}) =>
  useQuery({ queryKey: ['articles', category, page, limit], queryFn: () => get('/articles', { category, page, limit }) });

export const useArticle = (slug) =>
  useQuery({ queryKey: ['article', slug], queryFn: () => get(`/articles/${slug}`), enabled: !!slug });

/* ─── Pronostics ───────────────────────────────────────────── */
export const usePronostics = () =>
  useQuery({ queryKey: ['pronostics'], queryFn: () => get('/pronostics') });

export const useCreatePronostic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/pronostics', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pronostics'] }),
  });
};

/* ─── Actualités (RSS) ─────────────────────────────────────── */
export const useTransferNews = () =>
  useQuery({ queryKey: ['transfer-news'], queryFn: () => get('/football/transfers/news') });

export const useNewsLatest = (limit = 24) =>
  useQuery({ queryKey: ['news', limit], queryFn: () => get('/news/latest', { limit }) });
