const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

const app = express();
const port = process.env.PORT || 5001;

console.log('=== Configuration du serveur ===');
console.log('Port:', port);
console.log('Amadeus Client ID:', process.env.AMADEUS_CLIENT_ID ? 'Défini' : 'Non défini');
console.log('Amadeus Client Secret:', process.env.AMADEUS_CLIENT_SECRET ? 'Défini' : 'Non défini');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('__dirname:', __dirname);

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Routes
const apiRoutes = require('./routes/api');
console.log('Configuration des routes...');
app.use('/api', apiRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'API Voyage Replicator Hub est en ligne !',
    env: {
      nodeEnv: process.env.NODE_ENV,
      port: port,
      amadeusConfigured: Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET)
    }
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Gestionnaire pour les routes non trouvées
app.use((req, res) => {
  console.log(`Route non trouvée: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.method} ${req.url}`
  });
});

// Démarrer le serveur
const server = app.listen(port, () => {
  console.log(`\n=== Serveur démarré ===`);
  console.log(`URL: http://localhost:${port}`);
  console.log(`API Test: http://localhost:${port}/api/test`);
  console.log(`Documentation: http://localhost:${port}/api-docs`);
});

// Gestionnaire d'erreurs pour le serveur
server.on('error', (error) => {
  console.error('Erreur du serveur:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Le port ${port} est déjà utilisé. Veuillez utiliser un autre port.`);
    process.exit(1);
  }
});
