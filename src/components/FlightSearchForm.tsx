import React, { useState } from 'react';
import { AutocompleteInput } from './AutocompleteInput';
import { PassengerSelector } from './PassengerSelector';
import { FlightSearchForm as FlightSearchFormType } from '../types/search';

interface FlightSearchFormProps {
    onSearch: (searchData: FlightSearchFormType) => void;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({ onSearch }) => {
    const [roundTrip, setRoundTrip] = useState(true);
    const [formData, setFormData] = useState<FlightSearchFormType>({
        departureAirport: '',
        arrivalAirport: '',
        departureDate: '',
        returnDate: '',
        airline: '',
        passengers: {
            adults: 1,
            children: 0,
            infants: 0
        },
        cabinClass: 'ECONOMY'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roundTrip) {
            const searchData = { ...formData };
            delete searchData.returnDate;
            onSearch(searchData);
        } else {
            onSearch(formData);
        }
    };

    const updateFormData = (field: keyof FlightSearchFormType, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Calcul de la date minimum pour le départ (aujourd'hui)
    const today = new Date().toISOString().split('T')[0];
    
    // Calcul de la date minimum pour le retour (date de départ sélectionnée ou aujourd'hui)
    const minReturnDate = formData.departureDate || today;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow">
            {/* Type de vol */}
            <div className="flex space-x-4 mb-6">
                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        checked={roundTrip}
                        onChange={() => setRoundTrip(true)}
                        className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Aller-retour</span>
                </label>
                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        checked={!roundTrip}
                        onChange={() => setRoundTrip(false)}
                        className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Aller simple</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aéroport de départ */}
                <AutocompleteInput
                    type="airport"
                    value={formData.departureAirport}
                    onChange={(value) => updateFormData('departureAirport', value)}
                    label="Départ de"
                    placeholder="Ville ou aéroport de départ"
                    required
                />

                {/* Aéroport d'arrivée */}
                <AutocompleteInput
                    type="airport"
                    value={formData.arrivalAirport}
                    onChange={(value) => updateFormData('arrivalAirport', value)}
                    label="Arrivée à"
                    placeholder="Ville ou aéroport d'arrivée"
                    required
                />

                {/* Date de départ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de départ
                    </label>
                    <input
                        type="date"
                        value={formData.departureDate}
                        onChange={(e) => updateFormData('departureDate', e.target.value)}
                        min={today}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Date de retour */}
                {roundTrip && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de retour
                        </label>
                        <input
                            type="date"
                            value={formData.returnDate}
                            onChange={(e) => updateFormData('returnDate', e.target.value)}
                            min={minReturnDate}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Compagnie aérienne (optionnel) */}
                <AutocompleteInput
                    type="airline"
                    value={formData.airline || ''}
                    onChange={(value) => updateFormData('airline', value)}
                    label="Compagnie aérienne (optionnel)"
                    placeholder="Toutes les compagnies"
                />

                {/* Passagers */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passagers
                    </label>
                    <PassengerSelector
                        value={formData.passengers}
                        onChange={(value) => updateFormData('passengers', value)}
                    />
                </div>

                {/* Classe de cabine */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Classe
                    </label>
                    <select
                        value={formData.cabinClass}
                        onChange={(e) => updateFormData('cabinClass', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="ECONOMY">Économique</option>
                        <option value="PREMIUM_ECONOMY">Premium Économique</option>
                        <option value="BUSINESS">Affaires</option>
                        <option value="FIRST">Première</option>
                    </select>
                </div>
            </div>

            {/* Bouton de recherche */}
            <div className="mt-6">
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    Rechercher des vols
                </button>
            </div>
        </form>
    );
};
