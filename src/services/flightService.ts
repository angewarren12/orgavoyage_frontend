import { FlightSearchForm } from '../types/search';
import { config } from '../config';

const API_BASE_URL = `${config.apiUrl}/api`;

export interface FlightOffer {
    id: string;
    price: {
        amount: string;
        currency: string;
    };
    itineraries: Array<{
        duration: string;
        segments: Array<{
            departure: {
                airport: string;
                terminal?: string;
                time: string;
            };
            arrival: {
                airport: string;
                terminal?: string;
                time: string;
            };
            carrierCode: string;
            flightNumber: string;
            aircraft: string;
            duration: string;
            stops: number;
        }>;
    }>;
    validatingAirline: string;
    bookingClass: string;
}

export interface PriceConfirmation {
    price: {
        total: string;
        currency: string;
    };
    conditions: any;
}

export const searchFlights = async (searchData: FlightSearchForm): Promise<FlightOffer[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/flights/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                departureAirport: searchData.departureAirport,
                arrivalAirport: searchData.arrivalAirport,
                departureDate: searchData.departureDate,
                returnDate: searchData.returnDate,
                passengers: searchData.passengers,
                cabinClass: searchData.cabinClass,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la recherche de vols');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la recherche de vols:', error);
        throw error;
    }
};

export const confirmPrice = async (flightOfferId: string): Promise<PriceConfirmation> => {
    try {
        const response = await fetch(`${API_BASE_URL}/flights/price-confirmation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ flightOfferId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la confirmation du prix');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la confirmation du prix:', error);
        throw error;
    }
};