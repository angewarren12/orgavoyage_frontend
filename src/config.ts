export const config = {
    apiUrl: import.meta.env.PROD 
        ? 'https://orgavoyage-backend.onrender.com'
        : (import.meta.env.VITE_API_URL || 'http://localhost:5001'),
    amadeusClientId: import.meta.env.VITE_AMADEUS_CLIENT_ID,
    amadeusClientSecret: import.meta.env.VITE_AMADEUS_CLIENT_SECRET,
};
