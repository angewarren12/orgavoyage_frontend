import { Airport, Airline } from '../types/travel';

const API_BASE_URL = 'http://localhost:5001/api/autocomplete';

export const searchAirports = async (keyword: string): Promise<Airport[]> => {
    try {
        if (!keyword || keyword.length < 2) return [];
        
        const response = await fetch(`${API_BASE_URL}/airports?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la recherche des aéroports');
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la recherche des aéroports:', error);
        return [];
    }
};

export const searchAirlines = async (keyword: string): Promise<Airline[]> => {
    try {
        if (!keyword || keyword.length < 2) return [];
        
        const response = await fetch(`${API_BASE_URL}/airlines?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la recherche des compagnies aériennes');
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la recherche des compagnies aériennes:', error);
        return [];
    }
};
