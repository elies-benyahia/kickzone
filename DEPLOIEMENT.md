# Guide de déploiement — KickZone

## Architecture

```
KickZone/
├── client/     # React 19 + Vite  → build statique dans client/dist/
├── server/     # Node.js + Express 5 (port 3001), API REST
│   ├── config/db.js      # adaptateur SQLite (module natif node:sqlite)
│   └── database/         # schema.sql (référence), init.js, seed.js
├── render.yaml           # blueprint de déploiement de l'API sur Render
└── docker-compose.yml    # app + nginx (base SQLite dans un volume)
```

La base de données est un **simple fichier SQLite** (`server/database/kickzone.db`).
Aucun serveur MySQL/PostgreSQL à installer. Elle est **créée et remplie
automatiquement** au premier démarrage si elle est vide (`seedIfEmpty`).

---

## Pré-requis

| Outil | Version |
|-------|---------|
| Node.js | **22.5+ ou 24** (requis pour `node:sqlite`) |
| npm | 10+ |
| Git | 2.x |
| Docker | *(optionnel)* pour le déploiement conteneurisé |

---

## 1. Installation locale (développement)

```bash
git clone https://github.com/Elies-Benyahia/KickZone.git
cd KickZone

npm install                          # dépendances client + server (workspaces)

cp server/.env.example server/.env   # puis renseigner FOOTBALL_API_KEY
npm run db:reset --workspace=server  # crée + remplit la base SQLite

npm run dev                          # API :3001 + front :5173
```

Compte admin par défaut : `admin@kickzone.fr` / `Admin2026!`

### Variables d'environnement (`server/.env`)

| Variable | Obligatoire | Description | Valeur par défaut |
|----------|:-----------:|-------------|-------------------|
| `PORT` | non | Port de l'API | `3001` |
| `NODE_ENV` | non | `development` / `production` | `development` |
| `ALLOWED_ORIGINS` | non | Origines CORS autorisées (séparées par `,`) | `http://localhost:5173` |
| `DB_FILE` | non | Chemin du fichier SQLite | `./database/kickzone.db` |
| `JWT_SECRET` | **oui** | Clé de signature JWT (≥ 32 caractères) | *(fournie dans .env)* |
| `JWT_EXPIRES_IN` | non | Durée de validité du token | `7d` |
| `ADMIN_EMAIL` | non | Email du compte admin (seed) | `admin@kickzone.fr` |
| `ADMIN_PASSWORD` | non | Mot de passe admin (seed) | `Admin2026!` |
| `FOOTBALL_API_KEY` | recommandé | Clé [api-sports.io](https://dashboard.api-football.com) (100 req/jour en gratuit) | *(vide)* |

Sans `FOOTBALL_API_KEY`, l'application **fonctionne quand même** : les pages
football renvoient une liste vide et le seed génère des pronostics de démo.

---

## 2. Build de production (local)

```bash
npm run build --workspace=client     # génère client/dist/
NODE_ENV=production npm start --workspace=server
```

Servir `client/dist/` avec n'importe quel serveur statique (nginx, `vite preview`,
Netlify, Vercel…) et pointer `VITE_API_URL` vers l'URL publique de l'API.

---

## 3. Déploiement en ligne — Render (API) + Vercel (front)

### 3.1 API sur Render

1. Pousser le dépôt sur GitHub.
2. Sur [render.com](https://render.com) : **New + → Blueprint**, sélectionner le dépôt.
   Render lit `render.yaml` et crée le service **kickzone-api**.
3. Dans le service → **Environment**, renseigner :
   - `FOOTBALL_API_KEY` = votre clé api-sports.io
   - `ALLOWED_ORIGINS` = l'URL Vercel du front (ex. `https://kickzone.vercel.app`)
4. Déployer. L'URL de l'API ressemble à `https://kickzone-api.onrender.com`.
   Vérifier : `https://kickzone-api.onrender.com/api/health`.

> Plan gratuit Render : le disque n'est pas persistant et le service se met en
> veille après 15 min d'inactivité. Au réveil, la base SQLite est recréée et
> re-remplie automatiquement — les articles/pronos de démo reviennent seuls.
> Pour une base persistante : passer le service en plan payant, décommenter le
> bloc `disk:` dans `render.yaml` et ajouter `DB_FILE=/var/data/kickzone.db`.

### 3.2 Front sur Vercel

1. Sur [vercel.com](https://vercel.com) : **Add New → Project**, importer le dépôt.
2. **Root Directory** : `client` (Vercel détecte Vite, `client/vercel.json` gère le
   fallback SPA).
3. **Environment Variables** :
   - `VITE_API_URL` = `https://kickzone-api.onrender.com/api`
4. Déployer.

### 3.3 Après le premier déploiement

Mettre à jour `ALLOWED_ORIGINS` sur Render avec l'URL Vercel définitive, puis
redéployer l'API.

---

## 4. Déploiement Docker (VPS)

```bash
cp server/.env.example .env          # renseigner JWT_SECRET, FOOTBALL_API_KEY, ALLOWED_ORIGINS
npm run build --workspace=client     # génère client/dist/ servi par nginx
docker compose up -d --build
```

- `app` : API Node, base SQLite dans le volume `db_data` (persistante).
- `nginx` : sert `client/dist/` et proxifie `/api` vers `app:3001`
  (voir `nginx/nginx.conf`).

---

## 5. Tests

```bash
npm test --workspace=server          # 4 suites, 15 tests (Jest + Supertest)
```

---

## Récapitulatif des commandes

| Besoin | Commande |
|--------|----------|
| Tout installer | `npm install` |
| Réinitialiser la base | `npm run db:reset --workspace=server` |
| Dev (API + front) | `npm run dev` |
| Build front | `npm run build --workspace=client` |
| Lancer l'API en prod | `npm start --workspace=server` |
| Tests | `npm test --workspace=server` |
