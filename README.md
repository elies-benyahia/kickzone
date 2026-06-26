# KickZone

Site d'actualité football — transferts, résultats, classements, pronostics.

Projet réalisé dans le cadre du titre professionnel **DWWM (Développeur Web et Web Mobile — Niveau 5)**.

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Front-end | React 19, Vite, CSS Modules, React Router v6, React Query, Axios |
| Back-end | Node.js, Express, architecture MVC |
| BDD | MySQL 8, Prisma ORM |
| Auth | JWT, Bcrypt |
| Données football | API-Football (api-sports.io) avec cache mémoire 5 min |
| Sécurité | Helmet.js, CORS restrictif, express-validator, rate-limiting |
| DevOps | Docker, docker-compose, nginx reverse proxy |
| Tests | Jest, Supertest |

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
│   └── prisma/                # schema.prisma, seed.js
├── nginx/                     # nginx.conf (reverse proxy HTTPS)
├── docker-compose.yml
├── DEPLOIEMENT.md
└── .env.example
```

---

## Installation rapide (développement)

```bash
# 1. Cloner
git clone <repo>
cd kickzone

# 2. Variables d'environnement
cp .env.example .env
# Éditer server/.env avec vos valeurs (DATABASE_URL, JWT_SECRET, FOOTBALL_API_KEY)

# 3. Base de données + client Prisma
cd server
npm install
npx prisma generate
npx prisma db push

# 4. Lancer le back-end
npm run dev   # http://localhost:3001

# 5. Lancer le front-end (nouveau terminal)
cd ../client
npm install
npm run dev   # http://localhost:5173
```

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
| POST | `/api/pronostics` | Admin JWT | Créer |
| PUT | `/api/pronostics/:id` | Admin JWT | Modifier (résultat) |
| DELETE | `/api/pronostics/:id` | Admin JWT | Supprimer |

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/login` | Login admin |
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
cd server
npm test
```

3 suites, 8 tests :
- `articles.test.js` — GET liste, GET 404, POST 401, slugify()
- `pronostics.test.js` — GET liste, POST 401
- `football.test.js` — fixtures/today, standings (mock axios)

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
| Front-end sécurisé | Validation formulaires, headers Helmet, CORS |
| Back-end MVC | routes / controllers / services strict |
| BDD relationnelle | MySQL, Prisma, relations FK (Pronostic→User) |
| Composants métier | Proxy API-Football avec cache, CRUD admin, JWT |
| Déploiement documenté | DEPLOIEMENT.md, docker-compose, nginx |
| Tests | Jest unitaires + Supertest API (8 tests) |
| SEO | Balises sémantiques, meta description |
| Accessibilité | ARIA labels, navigation clavier, alt images |
