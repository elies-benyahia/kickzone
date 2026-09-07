FROM node:24-alpine AS base

WORKDIR /app

# Dépendances (production uniquement)
COPY package.json ./
RUN npm install --omit=dev

# Code source
COPY . .

EXPOSE 3001

# La base SQLite est créée et remplie automatiquement au démarrage
# (seedIfEmpty dans index.js) si elle est vide.
CMD ["node", "index.js"]
