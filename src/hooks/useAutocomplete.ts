import { useState, useEffect } from 'react';
import { searchAirports, searchAirlines } from '../services/autocompleteService';
import { Airport, Airline } from '../types/travel';

type AutocompleteType = 'airport' | 'airline';

export function useAutocomplete(type: AutocompleteType) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Airport[] | Airline[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const searchTimeout = setTimeout(async () => {
            if (!query || query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const searchResults = type === 'airport' 
                    ? await searchAirports(query)
                    : await searchAirlines(query);
                setResults(searchResults);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300); // Debounce de 300ms

        return () => clearTimeout(searchTimeout);
    }, [query, type]);

    return {
        query,
        setQuery,
        results,
        loading,
        error
    };
}
