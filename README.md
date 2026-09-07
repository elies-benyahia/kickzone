# KickZone

Site d'actualité football — transferts, résultats, classements, pronostics.

Projet réalisé dans le cadre du titre professionnel **DWWM (Développeur Web et Web Mobile — Niveau 5)**.

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Front-end | React 19, Vite, CSS Modules, React Router v7, React Query, Axios |
| Back-end | Node.js, Express 5, architecture MVC (routes / controllers / services) |
| BDD | SQLite via le module natif `node:sqlite` (fichier unique, zéro installation), SQL brut paramétré |
| Auth | JWT, Bcrypt |
| Données football | API-Football (api-sports.io) avec cache mémoire 5 min |
| Actualités | Flux RSS agrégés (L'Équipe, Foot Mercato, RMC…) via rss-parser |
| Sécurité | Helmet.js, CORS restrictif, express-validator, rate-limiting, requêtes SQL paramétrées |
| DevOps | Docker, docker-compose, nginx reverse proxy — déploiement Render + Vercel |
| Tests | Jest, Supertest (4 suites, 15 tests) |

---

## Architecture

```
/
├── client/                    # React 19 + Vite (SPA)
│   └── src/
│       ├── components/        # Navbar, MatchTicker, MatchCard, ArticleCard, StandingsTable, LiveBadge, PronoCard
│       ├── pages/             # Home, Matches, Match, Transferts, Actu, Article, Classements, Pronos, Admin, AdminLogin
│       ├── styles/            # globals.css — design system football bleu/blanc
│       └── hooks/             # api.js (React Query + axios vers /api)
├── server/                    # Express API (REST)
│   ├── controllers/           # articleController, footballController, pronosticController, authController
│   ├── services/              # articleService, footballService, pronosticService, authService
│   ├── routes/                # articles, football, pronostics, auth
│   ├── middlewares/           # auth (JWT), validate (express-validator), rateLimit
│   ├── config/db.js           # adaptateur SQLite (API compatible mysql2)
│   └── database/              # schema.sql (référence), init.js, seed.js, kickzone.db
├── nginx/                     # nginx.conf (reverse proxy HTTPS)
├── docker-compose.yml
├── render.yaml                # déploiement API sur Render
├── DEPLOIEMENT.md
└── .env.example
```

---

## Installation rapide (développement)

Pré-requis : **Node.js 22.5+ ou 24** (le module natif `node:sqlite`). Aucune base à installer.

```bash
# 1. Cloner
git clone https://github.com/Elies-Benyahia/KickZone.git
cd KickZone

# 2. Installer toutes les dépendances (workspaces client + server)
npm install

# 3. Variables d'environnement
cp server/.env.example server/.env
# Éditer server/.env : renseigner FOOTBALL_API_KEY (clé api-sports.io).
# JWT_SECRET et les identifiants admin ont déjà une valeur par défaut.

# 4. Créer + remplir la base SQLite
npm run db:reset --workspace=server

# 5. Lancer le back-end ET le front-end en une commande
npm run dev
#   API   → http://localhost:3001
#   Front → http://localhost:5173
```

> Sans `FOOTBALL_API_KEY`, le site fonctionne quand même : les pages football
> affichent « aucune donnée » et le seed crée des pronostics de démonstration.

Compte admin par défaut (créé par le seed) : **admin@kickzone.fr** / **Admin2026!**

---

## API Football

Toutes les données football viennent de [API-Football](https://www.api-football.com).

| Variable | Description |
|----------|-------------|
| `FOOTBALL_API_KEY` | Clé API (plan gratuit : 100 req/jour) |

Cache en mémoire : 5 min par défaut, 30 min pour les classements.

---

## API endpoints

### Articles
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/articles` | — | Liste paginée (`category`, `page`, `limit`) |
| GET | `/api/articles/:slug` | — | Article par slug |
| POST | `/api/articles` | Admin JWT | Créer |
| PUT | `/api/articles/:id` | Admin JWT | Modifier |
| DELETE | `/api/articles/:id` | Admin JWT | Supprimer |

### Football (proxy API-Football)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/football/fixtures/today` | Matchs du jour |
| GET | `/api/football/fixtures/date/:date` | Matchs par date |
| GET | `/api/football/fixtures/:id` | Détail match |
| GET | `/api/football/fixtures/:id/lineups` | Compositions |
| GET | `/api/football/fixtures/:id/stats` | Stats |
| GET | `/api/football/h2h/:team1/:team2` | H2H |
| GET | `/api/football/standings/:league` | Classement |
| GET | `/api/football/transfers/latest` | Derniers transferts |
| GET | `/api/football/transfers/:team` | Transferts d'une équipe |

### Pronostics
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/pronostics` | — | Liste des pronos |
| POST | `/api/pronostics` | JWT | Créer (utilisateur connecté) |
| PUT | `/api/pronostics/:id` | Admin JWT | Modifier (résultat) |
| DELETE | `/api/pronostics/:id` | Admin JWT | Supprimer |

### Actualités (RSS)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/news/latest` | Derniers articles agrégés des flux RSS |
| GET | `/api/news/category/:cat` | Filtré par mots-clés (transfert, resultats…) |

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Création de compte |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil (JWT) |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Accueil 3 colonnes : matchs du jour / articles / classements |
| `/matches` | Calendrier avec sélecteur de date et filtres ligues |
| `/match/:id` | Détail match : résumé, compositions, stats, H2H, classement |
| `/transferts` | Articles transferts + ticker live |
| `/actu` | Grille d'articles avec filtres catégories |
| `/article/:slug` | Lecture article |
| `/classements` | Classements Ligue 1, PL, Liga, BL, Serie A, UCL |
| `/pronos` | Pronostics admin publics + taux de réussite |
| `/admin` | Dashboard : gestion articles + pronostics |
| `/admin/login` | Connexion admin |

---

## Tests

```bash
npm test --workspace=server
```

4 suites, 15 tests (Jest + Supertest, base et axios mockés) :
- `auth.test.js` — login 401 / 200, hash bcrypt, JWT
- `articles.test.js` — GET liste `{ data, meta }`, GET 404, POST 401, filtre catégorie
- `pronostics.test.js` — GET liste, POST 401 sans JWT, POST 201 avec JWT admin
- `football.test.js` — fixtures/today, standings, cache (une seule requête réelle)

---

## Schéma base de données

| Table | Description |
|-------|-------------|
| `articles` | Articles (TRANSFERT, ACTU, ANALYSE, INTERVIEW, RESULTATS) |
| `pronostics` | Pronostics admin avec résultat et confiance |
| `users` | Comptes admin |

---

## Conformité DWWM

| Critère | Implémentation |
|---------|---------------|
| Front-end sécurisé | Validation formulaires, headers Helmet, CORS restrictif |
| Back-end MVC | routes / controllers / services strict |
| BDD relationnelle | SQLite, 3 tables, clé étrangère `pronostics.user_id → users.id` (ON DELETE CASCADE), SQL paramétré |
| Composants métier | Proxy API-Football avec cache mémoire, agrégateur RSS, CRUD admin, JWT |
| Déploiement documenté | DEPLOIEMENT.md, docker-compose, nginx, render.yaml (Render + Vercel) |
| Tests | Jest unitaires + Supertest API (15 tests) |
| SEO | Balises sémantiques, meta description |
| Accessibilité | ARIA labels, navigation clavier, alt images |
