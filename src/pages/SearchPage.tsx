import React, { useState } from 'react';
import { FlightSearchForm } from '../components/FlightSearchForm';
import { FlightSearchForm as FlightSearchFormType } from '../types/search';
import { searchFlights, FlightOffer } from '../services/flightService';
import { formatDate, formatTime, formatDuration } from '../utils/dateUtils';

export const SearchPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<FlightOffer[]>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (searchData: FlightSearchFormType) => {
        setLoading(true);
        setError(null);
        try {
            const results = await searchFlights(searchData);
            setSearchResults(results);
            setSearched(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const renderFlightSegment = (segment: FlightOffer['itineraries'][0]['segments'][0]) => (
        <div className="flex items-center space-x-4 p-4 border-b last:border-b-0">
            <div className="flex-1">
                <div className="flex justify-between mb-2">
                    <div>
                        <div className="font-bold">{formatTime(segment.departure.time)}</div>
                        <div className="text-sm text-gray-600">{segment.departure.airport}</div>
                        {segment.departure.terminal && (
                            <div className="text-xs text-gray-500">Terminal {segment.departure.terminal}</div>
                        )}
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-500">{formatDuration(segment.duration)}</div>
                        <div className="border-t border-gray-300 my-2"></div>
                        <div className="text-xs text-gray-500">
                            {segment.stops === 0 ? 'Direct' : `${segment.stops} escale${segment.stops > 1 ? 's' : ''}`}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold">{formatTime(segment.arrival.time)}</div>
                        <div className="text-sm text-gray-600">{segment.arrival.airport}</div>
                        {segment.arrival.terminal && (
                            <div className="text-xs text-gray-500">Terminal {segment.arrival.terminal}</div>
                        )}
                    </div>
                </div>
                <div className="text-sm text-gray-600">
                    {segment.carrierCode} {segment.flightNumber} • {segment.aircraft}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Rechercher un vol
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Trouvez les meilleurs vols aux meilleurs prix
                    </p>
                </div>

                <FlightSearchForm onSearch={handleSearch} />

                {loading && (
                    <div className="mt-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Recherche des vols...</p>
                    </div>
                )}

                {error && (
                    <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {searched && !loading && searchResults.length === 0 && !error && (
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-600">Aucun vol trouvé pour ces critères.</p>
                    </div>
                )}

                {searchResults.length > 0 && (
                    <div className="mt-8 space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {searchResults.length} vol{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                        </h2>
                        
                        {searchResults.map((offer) => (
                            <div key={offer.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-bold text-xl">
                                                {offer.price.amount} {offer.price.currency}
                                            </span>
                                            <div className="text-sm text-gray-500">
                                                {offer.bookingClass}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {/* Implémenter la réservation */}}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Réserver
                                        </button>
                                    </div>
                                </div>

                                {offer.itineraries.map((itinerary, index) => (
                                    <div key={index} className="border-b last:border-b-0">
                                        <div className="p-4 bg-gray-50">
                                            <div className="font-medium text-gray-700">
                                                {index === 0 ? 'Aller' : 'Retour'} • {formatDuration(itinerary.duration)}
                                            </div>
                                        </div>
                                        {itinerary.segments.map((segment, segmentIndex) => (
                                            <div key={segmentIndex}>
                                                {renderFlightSegment(segment)}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
