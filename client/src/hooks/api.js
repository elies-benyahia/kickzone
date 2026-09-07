// ============================================================================
//  hooks/api.js — tous les échanges avec l'API du serveur
//   - `api` : le client HTTP (axios) configuré une seule fois
//   - un "hook" par donnée à charger : useArticles(), useStandings()...
//  On utilise React Query : il gère le cache, le rechargement et les états
//  (isLoading, data, error) automatiquement.
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Client HTTP unique. En production VITE_API_URL vaut "/api" (même serveur) ;
// en développement, on tape directement le serveur Express local.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// "Interceptor" : avant CHAQUE requête, on ajoute le jeton JWT s'il existe.
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('kz_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Raccourci : fait un GET et renvoie directement le corps de la réponse (r.data).
const get = (url, params) => api.get(url, { params }).then((r) => r.data);

export { api }; // exporté pour AuthContext (login / register / logout)

const MIN = 60 * 1000; // 1 minute en millisecondes

// Détermine s'il faut rafraîchir automatiquement un match :
// toutes les minutes s'il est en cours, jamais s'il est terminé.
const LIVE = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'INT']; // codes "match en direct" de l'API
const refetchLive = (data) => {
  const fixture = Array.isArray(data) ? data[0] : data;
  const status = fixture?.fixture?.status?.short;
  return LIVE.includes(status) ? MIN : false;
};

// Rappel React Query :
//   queryKey  = identifiant unique de la donnée dans le cache
//   queryFn   = fonction qui va chercher la donnée
//   enabled   = ne lance la requête que si la condition est vraie
//   useQuery renvoie { data, isLoading, error, ... }

/* ─── Football (données de l'API-Football via notre serveur) ── */

// Matchs du jour (rechargé chaque minute pour suivre les scores en direct).
export const useFixturesToday = () =>
  useQuery({ queryKey: ['fixtures-today'], queryFn: () => get('/football/fixtures/today'), refetchInterval: MIN });

// Matchs d'une date précise (page Matchs). enabled: !!date -> attend qu'une date soit choisie.
export const useFixturesByDate = (date) =>
  useQuery({ queryKey: ['fixtures', date], queryFn: () => get(`/football/fixtures/date/${date}`), enabled: !!date });

// Détail d'un match. Rechargé chaque minute seulement s'il est en direct (refetchLive).
export const useFixture = (id) =>
  useQuery({ queryKey: ['fixture', id], queryFn: () => get(`/football/fixtures/${id}`), enabled: !!id, refetchInterval: refetchLive });

// Événements du match : buts, cartons, remplacements.
export const useFixtureEvents = (id) =>
  useQuery({ queryKey: ['events', id], queryFn: () => get(`/football/fixtures/${id}/events`), enabled: !!id, refetchInterval: MIN });

// Compositions d'équipe (le "onze" de départ).
export const useLineups = (id) =>
  useQuery({ queryKey: ['lineups', id], queryFn: () => get(`/football/fixtures/${id}/lineups`), enabled: !!id });

// Statistiques du match (possession, tirs, corners...).
export const useFixtureStats = (id) =>
  useQuery({ queryKey: ['stats', id], queryFn: () => get(`/football/fixtures/${id}/stats`), enabled: !!id });

// Historique des confrontations entre deux équipes.
export const useH2H = (t1, t2) =>
  useQuery({ queryKey: ['h2h', t1, t2], queryFn: () => get(`/football/h2h/${t1}/${t2}`), enabled: !!(t1 && t2) });

// Classement d'une compétition (pages Classements et Ligue des Champions).
export const useStandings = (league) =>
  useQuery({ queryKey: ['standings', league], queryFn: () => get(`/football/standings/${league}`), enabled: !!league });

// Fiche d'une équipe.
export const useTeam = (id) =>
  useQuery({ queryKey: ['team', id], queryFn: () => get(`/football/teams/${id}`), enabled: !!id });

// Statistiques saison d'une équipe dans une compétition (Ligue 1 par défaut).
export const useTeamStats = (id, league = 61) =>
  useQuery({ queryKey: ['team-stats', id, league], queryFn: () => get(`/football/teams/${id}/statistics`, { league }), enabled: !!id });

// Effectif complet d'une équipe.
export const useTeamSquad = (id) =>
  useQuery({ queryKey: ['squad', id], queryFn: () => get(`/football/teams/${id}/squad`), enabled: !!id });

// Barre de recherche : cherche EN PARALLÈLE joueurs + équipes + articles (à partir de 2 lettres).
export const useSearch = (q) =>
  useQuery({
    queryKey: ['search', q],
    enabled: q?.length >= 2,
    queryFn: async () => {
      // allSettled : si une des 2 recherches échoue, on garde quand même l'autre.
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

// Recherche de joueurs uniquement (page Joueurs).
export const usePlayerSearch = (q) =>
  useQuery({ queryKey: ['player-search', q], queryFn: () => get('/football/players/search', { q }), enabled: q?.length >= 2 });

// Fiche joueur : profil + transferts + palmarès.
export const usePlayer = (id) =>
  useQuery({ queryKey: ['player', id], queryFn: () => get(`/football/players/${id}`), enabled: !!id });

/* ─── Articles (base de données du serveur) ─────────────────── */

// Liste paginée d'articles, filtrable par catégorie.
export const useArticles = ({ category, page = 1, limit = 20 } = {}) =>
  useQuery({ queryKey: ['articles', category, page, limit], queryFn: () => get('/articles', { category, page, limit }) });

// Un article par son slug (page Article).
export const useArticle = (slug) =>
  useQuery({ queryKey: ['article', slug], queryFn: () => get(`/articles/${slug}`), enabled: !!slug });

/* ─── Pronostics ───────────────────────────────────────────── */

// Liste de tous les pronostics.
export const usePronostics = () =>
  useQuery({ queryKey: ['pronostics'], queryFn: () => get('/pronostics') });

// useMutation = pour ENVOYER des données (POST). Après succès, on invalide le
// cache 'pronostics' -> la liste se recharge toute seule avec le nouveau prono.
export const useCreatePronostic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/pronostics', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pronostics'] }),
  });
};

/* ─── Actualités (flux RSS agrégés par le serveur) ─────────── */

// Brèves mercato (filtrées par mots-clés côté serveur).
export const useTransferNews = () =>
  useQuery({ queryKey: ['transfer-news'], queryFn: () => get('/football/transfers/news') });

// Toutes les dernières actus football.
export const useNewsLatest = (limit = 24) =>
  useQuery({ queryKey: ['news', limit], queryFn: () => get('/news/latest', { limit }) });
