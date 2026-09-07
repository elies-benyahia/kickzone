# Guide de déploiement — KickZone

## Principe

**Un seul serveur Node.** En production, le serveur Express (`server/index.js`) :

1. expose l'API REST sous `/api/...`
2. sert le build React (`client/dist/`) pour tout le reste

Pas de nginx, pas de Docker, pas de second serveur. La base de données est un
**fichier SQLite** (`server/database/kickzone.db`), créé et rempli automatiquement
au premier démarrage s'il est vide.

```
KickZone/
├── client/     # React 19 + Vite      → build dans client/dist/
├── server/     # Node.js + Express 5  → API + sert client/dist/
│   ├── config/db.js   # adaptateur SQLite (module natif node:sqlite)
│   └── database/      # schema.sql (référence), init.js, seed.js
└── render.yaml        # déploiement en ligne (1 service)
```

---

## Pré-requis

| Outil | Version |
|-------|---------|
| Node.js | **22.5+ ou 24** (requis pour `node:sqlite`) |
| npm | 10+ |
| Git | 2.x |

Aucune base de données à installer.

---

## 1. Développement (2 serveurs, rechargement à chaud)

```bash
git clone https://github.com/Elies-Benyahia/KickZone.git
cd KickZone

npm install                          # dépendances client + server

cp server/.env.example server/.env   # puis renseigner FOOTBALL_API_KEY
npm run db:reset                     # crée + remplit la base SQLite

npm run dev                          # API :3001  +  front Vite :5173
```

Ouvrir **http://localhost:5173**
Compte admin (créé par le seed) : `admin@kickzone.fr` / `Admin2026!`

---

## 2. Test en conditions de production (local, 1 seul serveur)

```bash
npm run build          # génère client/dist/
npm start              # http://localhost:3001  (API + site)
```

Le site complet est servi sur **http://localhost:3001**.

---

## 3. Mise en ligne — Render (gratuit, 1 service)

1. Pousser le dépôt sur GitHub.
2. Sur [render.com](https://render.com) : **New + → Blueprint**, sélectionner le dépôt.
   Render lit `render.yaml` et crée le service **kickzone** :
   - `buildCommand` : `npm install && npm run build`
   - `startCommand` : `npm start`
3. Dans le service → **Environment** : renseigner `FOOTBALL_API_KEY`
   (clé [api-sports.io](https://dashboard.api-football.com), gratuite, 100 req/jour).
   `JWT_SECRET` est généré automatiquement.
4. Déployer. URL du type `https://kickzone.onrender.com`
   (vérifier `https://kickzone.onrender.com/api/health`).

> Plan gratuit : le service se met en veille après 15 min d'inactivité et le
> disque n'est pas persistant. Au réveil, la base SQLite est recréée et
> re-remplie toute seule (articles + pronostics de démo reviennent).

### Variables d'environnement

| Variable | Obligatoire | Description | Défaut |
|----------|:-----------:|-------------|--------|
| `PORT` | non | Port du serveur | `3001` |
| `NODE_ENV` | non | `development` / `production` | `development` |
| `JWT_SECRET` | **oui** | Clé JWT (≥ 32 caractères) | *(dans .env)* |
| `JWT_EXPIRES_IN` | non | Durée du token | `7d` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | non | Compte admin (seed) | `admin@kickzone.fr` / `Admin2026!` |
| `FOOTBALL_API_KEY` | recommandé | Clé api-sports.io | *(vide)* |
| `DB_FILE` | non | Chemin du fichier SQLite | `./database/kickzone.db` |

Sans `FOOTBALL_API_KEY`, le site fonctionne quand même : les pages football
affichent une liste vide et le seed crée des pronostics de démonstration.

---

## 4. Tests

```bash
npm test               # 4 suites, 15 tests (Jest + Supertest)
```

---

## Récapitulatif des commandes

| Besoin | Commande |
|--------|----------|
| Tout installer | `npm install` |
| Réinitialiser la base | `npm run db:reset` |
| Développement | `npm run dev` |
| Build front | `npm run build` |
| Lancer en production | `npm start` |
| Tests | `npm test` |
