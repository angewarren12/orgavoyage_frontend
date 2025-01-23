export interface FlightSearchForm {
    departureAirport: string;
    arrivalAirport: string;
    departureDate: string;
    returnDate?: string;
    airline?: string;
    passengers: {
        adults: number;
        children: number;
        infants: number;
    };
    cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
}

export interface SearchFormError {
    field: keyof FlightSearchForm | string;
    message: string;
}
