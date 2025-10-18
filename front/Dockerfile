# Étape 1 : build
FROM node:22.18.0-alpine AS build

WORKDIR /app

# Copier les fichiers package d'abord
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Passer l'URL du backend au moment du build - CORRIGÉ pour Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construire le frontend en statique
RUN npm run build

# Étape 2 : serveur Nginx pour servir les fichiers buildés
FROM nginx:alpine





# Exposer le port 80
EXPOSE 80

# Lancer nginx
CMD ["nginx", "-g", "daemon off;"]
