FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build production
RUN npm run build

# Installer un serveur léger pour servir le dossier dist
RUN npm install -g serve

EXPOSE 5173

# Lancer le serveur de production
CMD ["serve", "-s", "dist", "-l", "5173"]
