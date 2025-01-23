import React, { useState } from 'react';

interface PassengerCount {
    adults: number;
    children: number;
    infants: number;
}

interface PassengerSelectorProps {
    value: PassengerCount;
    onChange: (value: PassengerCount) => void;
}

export const PassengerSelector: React.FC<PassengerSelectorProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const updateCount = (type: keyof PassengerCount, delta: number) => {
        console.log('Current value:', value);
        console.log('Updating', type, 'by', delta);
        
        const newValue = { ...value };
        newValue[type] = Math.max(type === 'adults' ? 1 : 0, Math.min(9, value[type] + delta));
        
        // Vérifications de validation
        if (type === 'adults' && newValue.infants > newValue.adults) {
            newValue.infants = newValue.adults; // Les bébés ne peuvent pas être plus nombreux que les adultes
        }
        if ((newValue.adults + newValue.children + newValue.infants) > 9) {
            return; // Maximum 9 passagers au total
        }

        console.log('New value:', newValue);
        onChange(newValue);
    };

    const totalPassengers = value.adults + value.children + value.infants;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-left"
            >
                {totalPassengers} passager{totalPassengers > 1 ? 's' : ''}
            </button>

            {isOpen && (
                <div className="absolute z-20 w-72 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                    {/* Adultes */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="font-medium">Adultes</div>
                            <div className="text-sm text-gray-500">12 ans et plus</div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => updateCount('adults', -1)}
                                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                                disabled={value.adults <= 1}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <span className="w-8 text-center">{value.adults}</span>
                            <button
                                type="button"
                                onClick={() => updateCount('adults', 1)}
                                className="p-1 rounded-full hover:bg-gray-100"
                                disabled={totalPassengers >= 9}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Enfants */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="font-medium">Enfants</div>
                            <div className="text-sm text-gray-500">2-11 ans</div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => updateCount('children', -1)}
                                className="p-1 rounded-full hover:bg-gray-100"
                                disabled={value.children <= 0}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <span className="w-8 text-center">{value.children}</span>
                            <button
                                type="button"
                                onClick={() => updateCount('children', 1)}
                                className="p-1 rounded-full hover:bg-gray-100"
                                disabled={totalPassengers >= 9}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Bébés */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Bébés</div>
                            <div className="text-sm text-gray-500">Moins de 2 ans</div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => updateCount('infants', -1)}
                                className="p-1 rounded-full hover:bg-gray-100"
                                disabled={value.infants <= 0}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <span className="w-8 text-center">{value.infants}</span>
                            <button
                                type="button"
                                onClick={() => updateCount('infants', 1)}
                                className="p-1 rounded-full hover:bg-gray-100"
                                disabled={value.infants >= value.adults || totalPassengers >= 9}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
