const express = require('express');
const { getAirportInfo, getMultipleAirports } = require('../controllers/airportController');

const router = express.Router();

console.log('Configuration des routes d\'aéroport...');

// Route pour les requêtes batch (doit être avant la route avec paramètre)
router.post('/airports/batch', (req, res, next) => {
  console.log('POST /airports/batch appelé');
  console.log('Body:', req.body);
  getMultipleAirports(req, res, next);
});

// Route pour un seul aéroport
router.get('/airports/:iataCode', (req, res, next) => {
  console.log('GET /airports/:iataCode appelé');
  console.log('Params:', req.params);
  getAirportInfo(req, res, next);
});

// Route de test pour vérifier que le routeur fonctionne
router.get('/test', (req, res) => {
  res.json({ message: 'API Router fonctionne correctement' });
});

// Log toutes les routes configurées
console.log('Routes configurées:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).join(', ').toUpperCase()}: ${r.route.path}`);
  }
});

// Export du router
module.exports = router;
