# Image Node.js officielle avec Alpine (plus légère)
FROM node:22.18.0-alpine

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances 
RUN npm install

# Copier le reste du code source
COPY . .

# Copier le .env (si tu veux utiliser des variables locales)
COPY .env ./

# Exposer le port utilisé par l'application
EXPOSE 5000

# Définit l'environnement
ENV NODE_ENV=production

# Commande pour démarrer l'application
CMD ["npm", "start"]
