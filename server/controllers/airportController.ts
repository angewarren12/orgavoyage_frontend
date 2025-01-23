const Amadeus = require('amadeus');

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

console.log('Amadeus client configuré avec:', {
  clientId: process.env.AMADEUS_CLIENT_ID ? 'Défini' : 'Non défini',
  clientSecret: process.env.AMADEUS_CLIENT_SECRET ? 'Défini' : 'Non défini'
});

// Cache pour stocker les informations des aéroports
const airportCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

interface CachedAirport {
  data: any;
  timestamp: number;
}

const getAirportInfo = async (req, res) => {
  const iataCode = req.params.iataCode.toUpperCase();
  console.log(`Recherche d'informations pour l'aéroport: ${iataCode}`);

  try {
    // Vérifier le cache
    const cached = airportCache.get(iataCode) as CachedAirport;
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Données trouvées dans le cache pour ${iataCode}`);
      return res.json({
        success: true,
        data: cached.data,
        source: 'cache'
      });
    }

    console.log(`Recherche via Amadeus pour ${iataCode}`);
    // Rechercher les informations de l'aéroport via Amadeus
    const response = await amadeus.referenceData.locations.get({
      keyword: iataCode,
      subType: 'AIRPORT'
    });

    console.log(`Réponse Amadeus pour ${iataCode}:`, response.data);

    if (response.data && response.data.length > 0) {
      const airportData = response.data[0];
      const airport = {
        iataCode: airportData.iataCode,
        name: airportData.name,
        latitude: parseFloat(airportData.geoCode.latitude),
        longitude: parseFloat(airportData.geoCode.longitude),
        city: airportData.address.cityName,
        country: airportData.address.countryName
      };

      // Mettre en cache
      airportCache.set(iataCode, {
        data: airport,
        timestamp: Date.now()
      });

      console.log(`Données mises en cache pour ${iataCode}`);
      res.json({
        success: true,
        data: airport,
        source: 'amadeus'
      });
    } else {
      console.log(`Aucune donnée trouvée pour ${iataCode}`);
      res.status(404).json({
        success: false,
        message: 'Aéroport non trouvé'
      });
    }
  } catch (error) {
    console.error(`Erreur pour ${iataCode}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations de l\'aéroport',
      error: error.message
    });
  }
};

const getMultipleAirports = async (req, res) => {
  console.log('Requête batch reçue');
  console.log('Body:', req.body);
  
  const { iataCodes } = req.body;

  if (!Array.isArray(iataCodes)) {
    console.error('iataCodes n\'est pas un tableau:', iataCodes);
    return res.status(400).json({
      success: false,
      message: 'iataCodes doit être un tableau'
    });
  }

  console.log(`Recherche d'informations pour ${iataCodes.length} aéroports:`, iataCodes);

  try {
    const results = [];
    const uncachedCodes = [];

    // Vérifier d'abord le cache
    for (const code of iataCodes) {
      const cached = airportCache.get(code) as CachedAirport;
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`Données trouvées dans le cache pour ${code}`);
        results.push(cached.data);
      } else {
        uncachedCodes.push(code);
      }
    }

    console.log(`Codes non mis en cache: ${uncachedCodes.length}`, uncachedCodes);

    // Récupérer les informations pour les codes non mis en cache
    for (const code of uncachedCodes) {
      try {
        console.log(`Recherche via Amadeus pour ${code}`);
        const response = await amadeus.referenceData.locations.get({
          keyword: code,
          subType: 'AIRPORT'
        });

        if (response.data && response.data.length > 0) {
          const airportData = response.data[0];
          const airport = {
            iataCode: airportData.iataCode,
            name: airportData.name,
            latitude: parseFloat(airportData.geoCode.latitude),
            longitude: parseFloat(airportData.geoCode.longitude),
            city: airportData.address.cityName,
            country: airportData.address.countryName
          };

          // Mettre en cache
          airportCache.set(code, {
            data: airport,
            timestamp: Date.now()
          });

          console.log(`Données mises en cache pour ${code}`);
          results.push(airport);
        } else {
          console.log(`Aucune donnée trouvée pour ${code}`);
        }
      } catch (error) {
        console.error(`Erreur pour l'aéroport ${code}:`, error);
      }
    }

    console.log(`Envoi de ${results.length} résultats`);
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations des aéroports:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations des aéroports',
      error: error.message
    });
  }
};

module.exports = {
  getAirportInfo,
  getMultipleAirports
};
