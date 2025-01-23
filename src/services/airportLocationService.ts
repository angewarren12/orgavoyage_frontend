import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

interface AirportLocation {
  iataCode: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

class AirportLocationService {
  private static instance: AirportLocationService;
  private cache: Map<string, AirportLocation>;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures
  private lastCacheUpdate: number;

  private constructor() {
    this.cache = new Map();
    this.lastCacheUpdate = 0;
    this.loadCacheFromLocalStorage();
  }

  public static getInstance(): AirportLocationService {
    if (!AirportLocationService.instance) {
      AirportLocationService.instance = new AirportLocationService();
    }
    return AirportLocationService.instance;
  }

  private loadCacheFromLocalStorage() {
    try {
      const savedCache = localStorage.getItem('airportLocations');
      const savedTimestamp = localStorage.getItem('airportLocationsTimestamp');
      
      if (savedCache && savedTimestamp) {
        const timestamp = parseInt(savedTimestamp);
        if (Date.now() - timestamp < this.CACHE_DURATION) {
          this.cache = new Map(JSON.parse(savedCache));
          this.lastCacheUpdate = timestamp;
          return;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cache:', error);
    }
    
    this.cache.clear();
    this.lastCacheUpdate = Date.now();
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('airportLocations', JSON.stringify(Array.from(this.cache.entries())));
      localStorage.setItem('airportLocationsTimestamp', this.lastCacheUpdate.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error);
    }
  }

  public async getAirportLocation(iataCode: string): Promise<AirportLocation | null> {
    // Vérifier le cache d'abord
    if (this.cache.has(iataCode)) {
      return this.cache.get(iataCode) || null;
    }

    try {
      console.log(`Récupération des informations pour l'aéroport ${iataCode}...`);
      const response = await axios.get(`${API_BASE_URL}/autocomplete/airports`, {
        params: {
          keyword: iataCode
        }
      });
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const airportData = response.data[0];
        const location: AirportLocation = {
          iataCode: airportData.iataCode,
          name: airportData.name,
          latitude: parseFloat(airportData.latitude),
          longitude: parseFloat(airportData.longitude),
          city: airportData.city,
          country: airportData.country
        };

        // Mettre en cache
        this.cache.set(iataCode, location);
        this.saveToLocalStorage();

        return location;
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des informations pour l'aéroport ${iataCode}:`, error);
    }

    return null;
  }

  public async getMultipleAirportLocations(iataCodes: string[]): Promise<Map<string, AirportLocation>> {
    console.log('Récupération des informations pour les aéroports:', iataCodes);
    const results = new Map<string, AirportLocation>();
    const uncachedCodes = iataCodes.filter(code => !this.cache.has(code));

    // Récupérer les données en cache
    iataCodes.forEach(code => {
      if (this.cache.has(code)) {
        const location = this.cache.get(code);
        if (location) {
          results.set(code, location);
        }
      }
    });

    if (uncachedCodes.length > 0) {
      try {
        console.log('Codes non mis en cache:', uncachedCodes);
        // Faire une requête pour chaque aéroport non mis en cache
        const promises = uncachedCodes.map(code => this.getAirportLocation(code));
        const locations = await Promise.all(promises);
        
        locations.forEach(location => {
          if (location) {
            results.set(location.iataCode, location);
          }
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des informations des aéroports:', error);
      }
    }

    return results;
  }
}

export const airportLocationService = AirportLocationService.getInstance();
