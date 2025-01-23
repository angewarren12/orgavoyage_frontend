import React from 'react';

interface Flight {
    type: string;
    id: string;
    source: string;
    itineraries: Array<{
        duration: string;
        segments: Array<{
            departure: {
                iataCode: string;
                at: string;
            };
            arrival: {
                iataCode: string;
                at: string;
            };
            carrierCode: string;
            number: string;
            aircraft: {
                code: string;
            };
            duration: string;
            numberOfStops: number;
        }>;
    }>;
    price: {
        currency: string;
        total: string;
        base: string;
    };
    travelerPricings: Array<{
        travelerId: string;
        fareOption: string;
        travelerType: string;
        price: {
            currency: string;
            total: string;
        };
        fareDetailsBySegment: Array<{
            cabin: string;
            class: string;
        }>;
    }>;
}

interface FlightResultsProps {
    flights: Flight[];
    onSelect?: (flight: Flight) => void;
}

export const FlightResults: React.FC<FlightResultsProps> = ({ flights, onSelect }) => {
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatDuration = (duration: string) => {
        return duration
            .replace('PT', '')
            .replace('H', 'h ')
            .replace('M', 'm');
    };

    if (!flights || flights.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Aucun vol trouvé</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {flights.map((flight) => (
                <div
                    key={flight.id}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => onSelect?.(flight)}
                >
                    {flight.itineraries.map((itinerary, index) => (
                        <div key={index} className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <div className="text-lg font-semibold">
                                            {itinerary.segments[0].departure.iataCode} →{' '}
                                            {itinerary.segments[itinerary.segments.length - 1].arrival.iataCode}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatDuration(itinerary.duration)}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {formatDateTime(itinerary.segments[0].departure.at)} →{' '}
                                        {formatDateTime(itinerary.segments[itinerary.segments.length - 1].arrival.at)}
                                    </div>
                                </div>
                            </div>

                            {itinerary.segments.length > 1 && (
                                <div className="text-sm text-gray-500 mt-1">
                                    {itinerary.segments.length - 1} escale(s)
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <div>
                            <div className="text-sm text-gray-600">
                                {flight.travelerPricings[0].fareDetailsBySegment[0].cabin}
                            </div>
                            <div className="text-xs text-gray-500">
                                {flight.travelerPricings[0].fareDetailsBySegment[0].class}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">
                                {flight.price.total} {flight.price.currency}
                            </div>
                            <div className="text-xs text-gray-500">
                                Prix total
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
