FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build pour production
RUN npm run build

EXPOSE 5173

# Serveur de preview sur toutes les interfaces
CMD ["npm", "run", "dev"]
