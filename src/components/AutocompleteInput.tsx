import React from 'react';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { Airport, Airline } from '../types/travel';

interface AutocompleteInputProps {
    type: 'airport' | 'airline';
    value: string;
    onChange: (value: string, item?: Airport | Airline) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    type,
    value,
    onChange,
    placeholder,
    label,
    required = false,
}) => {
    const { query, setQuery, results, loading, error } = useAutocomplete(type);

    const handleSelect = (item: Airport | Airline) => {
        onChange(item.code, item);
        setQuery('');
    };

    return (
        <div className="relative">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type="text"
                value={query || value}
                onChange={(e) => {
                    setQuery(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required={required}
            />
            
            {/* Liste des suggestions */}
            {query && results.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {results.map((item) => (
                        <li
                            key={item.code}
                            onClick={() => handleSelect(item)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            <div className="font-medium">{item.name}</div>
                            {type === 'airport' && (
                                <div className="text-sm text-gray-500">
                                    {(item as Airport).city}, {(item as Airport).country}
                                </div>
                            )}
                            <div className="text-xs text-gray-400">{item.code}</div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Message d'erreur */}
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}

            {/* Indicateur de chargement */}
            {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
};
