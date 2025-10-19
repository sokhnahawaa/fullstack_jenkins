const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./connectdb');
const smartphoneRoutes = require('./routes/smartphoneRoutes');

dotenv.config();

// Connexion à MongoDB
connectDB();

// Création de l'application Express
const app = express();

// Configuration CORS COMPLÈTE
app.use(cors({
  origin: [
    'http://localhost:30002', 
    'http://172.17.0.2:30002', 
    'http://localhost:5173', 
    'http://127.0.0.1:30002',
    'http://127.0.0.1:50543',
    'http://localhost:3000',
    'http://localhost:5173'  // Ajout pour Vite dev server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-delete-code']
}));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Autoriser un body JSON plus gros
app.use(express.json({ limit: "10mb" }));

// Route de santé pour les tests
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smartphone Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      smartphones: '/api/smartphones'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes API
app.use('/api', smartphoneRoutes);

// Middleware 404
// Middleware 404 (corrigé)
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});


// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur lancé sur http://0.0.0.0:${PORT}`);
  console.log(`📍 URL locale: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`📱 API: http://localhost:${PORT}/api/smartphones`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
});
