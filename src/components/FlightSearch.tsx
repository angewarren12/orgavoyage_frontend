import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlightSearchForm } from './FlightSearchForm';
import { FlightSearchForm as FlightSearchFormType } from '../types/search';
import axios from 'axios';
import { config } from '../config';
import { searchHistoryService } from '@/services/searchHistoryService';

interface FlightSearchResponse {
    success: boolean;
    data: any; 
    error?: string;
}

export const FlightSearch: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSearch = async (searchData: FlightSearchFormType) => {
        setLoading(true);
        setError(null);
        
        // Enregistrer la recherche dans l'historique
        searchHistoryService.addSearch({
            departure: searchData.departureAirport,
            arrival: searchData.arrivalAirport,
            date: searchData.departureDate,
            returnDate: searchData.returnDate || undefined,
            passengers: searchData.passengers,
        });

        try {
            console.log('Sending search request...');
            const response = await axios.post(`${config.apiUrl}/api/flights/search`, {
                departureAirport: searchData.departureAirport,
                arrivalAirport: searchData.arrivalAirport,
                departureDate: searchData.departureDate,
                returnDate: searchData.returnDate,
                passengers: searchData.passengers,
                cabinClass: searchData.cabinClass
            });

            console.log('Search response:', response.data);
            
            if (response.data.success) {
                console.log('Navigating to results page with data:', response.data.data);
                navigate('/search-results', {
                    state: { 
                        searchResults: response.data.data,
                        searchCriteria: searchData
                    }
                });
            } else {
                setError('Erreur lors de la recherche de vols');
            }
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la recherche');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-8">Rechercher un vol</h1>
            <FlightSearchForm onSearch={handleSearch} />
            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}
            {loading && (
                <div className="mt-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-600">Recherche en cours...</p>
                </div>
            )}
        </div>
    );
};
