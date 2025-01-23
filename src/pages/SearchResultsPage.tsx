import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane, CreditCard, User, Calendar, Filter, SortAsc, Heart, Bell, History } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FavoriteFlights } from '@/components/FavoriteFlights';
import { PriceAlerts } from '@/components/PriceAlerts';
import { SearchHistory } from '@/components/SearchHistory';
import { airportLocationService } from '@/services/airportLocationService';

interface FlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  duration: string;
  id: string;
}

interface FlightOffer {
  id: string;
  itineraries: {
    duration: string;
    segments: FlightSegment[];
  }[];
  price: {
    total: string;
    currency: string;
  };
  travelerPricings: {
    fareDetailsBySegment: {
      cabin: string;
      includedCheckedBags: {
        quantity: number;
      };
      class: string;
    }[];
  }[];
}

interface Dictionaries {
  carriers: {
    [key: string]: string;
  };
}

interface Filters {
  priceRange: [number, number];
  airlines: string[];
  maxDuration: number;
  timeOfDay: 'all' | 'day' | 'night';
}

export const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state?.searchParams;
  const [searchResults, setSearchResults] = useState<any>(null);
  const [carriers, setCarriers] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(1);
  const [airportNames, setAirportNames] = useState<{ [key: string]: string }>({});
  const [displayedResults, setDisplayedResults] = useState<FlightOffer[]>([]);
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 10000],
    airlines: [],
    maxDuration: 48,
    timeOfDay: 'all'
  });

  // Récupérer les paramètres de recherche depuis location.state
  const searchState = location.state || {};
  const searchCriteria = searchState.searchCriteria || {};
  const passengerCount = searchCriteria.passengers || { adults: 1, children: 0, infants: 0 };
  const totalPassengers = passengerCount.adults + passengerCount.children + passengerCount.infants;

  console.log('Search criteria:', searchCriteria);
  console.log('Passenger count:', passengerCount);
  console.log('Total passengers:', totalPassengers);

  const parsePrice = (price: string) => parseFloat(price);

  // Calculer le prix total pour tous les passagers
  const calculateTotalPrice = (price: string) => {
    const basePrice = parseFloat(price);
    return (basePrice * totalPassengers).toFixed(2);
  };

  // Afficher le prix formaté
  const formatPrice = (price: string, currency: string) => {
    return `${calculateTotalPrice(price)} ${currency}`;
  };

  const parseDuration = (duration: string) => {
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return parseInt(hours) + parseInt(minutes) / 60;
  };

  const isNightFlight = (departure: string) => {
    const hour = new Date(departure).getHours();
    return hour >= 20 || hour <= 6;
  };

  // Détermine si c'est un vol aller simple en vérifiant si returnDate est absent
  const isOneWay = !searchParams?.returnDate;

  // Filtrer les vols pour n'afficher que l'aller si c'est un vol aller simple
  const processedResults = useMemo(() => {
    if (!searchResults?.data) return [];
    return searchResults.data.map(flight => {
      if (isOneWay) {
        return {
          ...flight,
          itineraries: [flight.itineraries[0]] // Ne garde que l'aller
        };
      }
      return flight;
    });
  }, [searchResults, isOneWay]);

  const filteredResults = useMemo(() => {
    if (!searchResults?.data) return [];

    return processedResults.filter(flight => {
      const price = parsePrice(flight.price.total);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;

      if (filters.airlines.length > 0) {
        const flightAirlines = new Set(
          flight.itineraries.flatMap(it => 
            it.segments.map(seg => seg.carrierCode)
          )
        );
        if (!filters.airlines.some(airline => flightAirlines.has(airline))) {
          return false;
        }
      }

      const totalDuration = flight.itineraries.reduce((acc, it) => 
        acc + parseDuration(it.duration), 0
      );
      if (totalDuration > filters.maxDuration) return false;

      if (filters.timeOfDay !== 'all') {
        const isDeparturingAtNight = flight.itineraries.some(it =>
          isNightFlight(it.segments[0].departure.at)
        );
        if (filters.timeOfDay === 'night' && !isDeparturingAtNight) return false;
        if (filters.timeOfDay === 'day' && isDeparturingAtNight) return false;
      }

      return true;
    });
  }, [processedResults, filters]);

  const availableAirlines = useMemo(() => {
    if (!searchResults?.data) return [];
    const airlines = new Set<string>();
    searchResults.data.forEach((flight: FlightOffer) => {
      flight.itineraries.forEach(it => {
        it.segments.forEach(seg => {
          airlines.add(seg.carrierCode);
        });
      });
    });
    return Array.from(airlines);
  }, [searchResults]);

  const maxAvailablePrice = useMemo(() => {
    if (!searchResults?.data) return 10000;
    return Math.max(...searchResults.data.map((flight: FlightOffer) => 
      parseFloat(flight.price.total)
    ));
  }, [searchResults]);

  const maxAvailableDuration = useMemo(() => {
    if (!searchResults?.data) return 48;
    return Math.max(...searchResults.data.map((flight: FlightOffer) => 
      flight.itineraries.reduce((acc, it) => acc + parseDuration(it.duration), 0)
    ));
  }, [searchResults]);

  useEffect(() => {
    if (!location.state?.searchResults) {
      navigate('/');
      return;
    }

    console.log('Raw search results:', location.state.searchResults);
    const { data, dictionaries } = location.state.searchResults;
    
    if (Array.isArray(data)) {
      console.log('Setting search results:', data);
      setSearchResults({ data, dictionaries });
      // Stockage du dictionnaire des compagnies
      if (dictionaries?.carriers) {
        setCarriers(dictionaries.carriers);
      }
    } else {
      console.error('Invalid flight data format:', location.state.searchResults);
      setSearchResults(null);
    }
  }, [location.state, navigate]);

  // Charger les noms des aéroports
  useEffect(() => {
    const loadAirportNames = async () => {
      if (!searchResults?.data) return;
      
      // Collecter tous les codes IATA uniques
      const iataCodes = new Set<string>();
      searchResults.data.forEach((flight: any) => {
        flight.itineraries.forEach((itinerary: any) => {
          itinerary.segments.forEach((segment: any) => {
            iataCodes.add(segment.departure.iataCode);
            iataCodes.add(segment.arrival.iataCode);
          });
        });
      });

      // Charger les informations pour chaque aéroport
      const airportLocations = await airportLocationService.getMultipleAirportLocations(Array.from(iataCodes));
      const names: { [key: string]: string } = {};
      airportLocations.forEach((location, code) => {
        names[code] = `${location.name} (${code})`;
      });
      setAirportNames(names);
    };

    loadAirportNames();
  }, [searchResults]);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  const formatDuration = (duration: string) => {
    return duration
      .replace('PT', '')
      .replace('H', 'h ')
      .replace('M', 'm');
  };

  const getStopsLabel = (segments: FlightSegment[]) => {
    const stops = segments.length - 1;
    if (stops === 0) return 'Direct';
    return `${stops} ${stops === 1 ? 'escale' : 'escales'}`;
  };

  const handleSort = (option: string) => {
    const sorted = [...filteredResults].sort((a, b) => {
      if (option === 'price') {
        return parseFloat(a.price.total) - parseFloat(b.price.total);
      } else if (option === 'duration') {
        const durationA = a.itineraries[0].duration.replace('PT', '').replace('H', '.').replace('M', '');
        const durationB = b.itineraries[0].duration.replace('PT', '').replace('H', '.').replace('M', '');
        return parseFloat(durationA) - parseFloat(durationB);
      }
      return 0;
    });
    setDisplayedResults(sorted);
  };

  const handleFlightSelect = (flight: FlightOffer) => {
    console.log('Flight selected:', flight);
    console.log('Carriers:', carriers);
    console.log('Number of passengers:', totalPassengers);
    
    try {
      navigate('/booking-summary', { 
        state: { 
          selectedFlight: {
            ...flight,
            price: {
              ...flight.price,
              total: calculateTotalPrice(flight.price.total)
            }
          }, 
          carriers,
          numberOfPassengers: totalPassengers,
          passengerCount
        } 
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const resultsPerPage = 3;
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  const handleNextPage = () => {
    setPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setPage(prev => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && filteredResults.length > page * resultsPerPage) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [filteredResults.length, page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Colonne de gauche - Filtres */}
          <div className="lg:w-1/4 space-y-6">
            {/* Filtres */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-[#2563eb]" />
                Filtres
              </h2>
              <div className="space-y-6">
                {/* Prix */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Prix</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, maxAvailablePrice]}
                      max={maxAvailablePrice}
                      step={10}
                      value={filters.priceRange}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{filters.priceRange[0]}€</span>
                      <span>{filters.priceRange[1]}€</span>
                    </div>
                  </div>
                </div>

                {/* Compagnies aériennes */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Compagnies aériennes</h3>
                  <div className="space-y-2">
                    {availableAirlines.map(airline => (
                      <div key={airline} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`airline-${airline}`}
                          checked={filters.airlines.includes(airline)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                airlines: [...prev.airlines, airline]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                airlines: prev.airlines.filter(a => a !== airline)
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`airline-${airline}`} className="text-sm">
                          {carriers[airline] || airline}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Durée maximale */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Durée maximale</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[filters.maxDuration]}
                      max={maxAvailableDuration}
                      step={1}
                      value={[filters.maxDuration]}
                      onValueChange={([value]) => setFilters(prev => ({ ...prev, maxDuration: value }))}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{Math.floor(filters.maxDuration)}h{Math.round((filters.maxDuration % 1) * 60)}m</span>
                    </div>
                  </div>
                </div>

                {/* Moment de la journée */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Moment du vol</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timeOfDay"
                        value="all"
                        checked={filters.timeOfDay === 'all'}
                        onChange={(e) => setFilters(prev => ({ ...prev, timeOfDay: e.target.value as 'all' | 'day' | 'night' }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Tous les horaires</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timeOfDay"
                        value="day"
                        checked={filters.timeOfDay === 'day'}
                        onChange={(e) => setFilters(prev => ({ ...prev, timeOfDay: e.target.value as 'all' | 'day' | 'night' }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Vols de jour (6h-20h)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timeOfDay"
                        value="night"
                        checked={filters.timeOfDay === 'night'}
                        onChange={(e) => setFilters(prev => ({ ...prev, timeOfDay: e.target.value as 'all' | 'day' | 'night' }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Vols de nuit (20h-6h)</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            {/* Historique des recherches */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <History className="w-5 h-5 mr-2 text-[#2563eb]" />
                Historique
              </h2>
              <SearchHistory />
            </Card>

            {/* Alertes de prix */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-[#2563eb]" />
                Alertes de prix
              </h2>
              <PriceAlerts />
            </Card>

            {/* Favoris */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-[#2563eb]" />
                Favoris
              </h2>
              <FavoriteFlights />
            </Card>
          </div>

          {/* Colonne de droite - Résultats */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold">
                {filteredResults.length} vol{filteredResults.length > 1 ? 's' : ''} trouvé{filteredResults.length > 1 ? 's' : ''}
                {isOneWay ? ' (Aller simple)' : ' (Aller-retour)'}
              </h1>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4" />
                    Trier par
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleSort('price')}>
                    Prix
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('duration')}>
                    Durée
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Résultats ({filteredResults.length} vols trouvés)</h2>
                </div>

                <div className="flex flex-col space-y-4">
                  {/* Filtres */}
                </div>
              </div>

              {/* Container des résultats avec pagination */}
              <div className="mt-6 space-y-4">
                {filteredResults.slice((page - 1) * resultsPerPage, page * resultsPerPage).map((flight: FlightOffer) => (
                  <div 
                    key={flight.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative overflow-hidden cursor-pointer"
                    onClick={() => {
                      console.log('Card clicked');
                      handleFlightSelect(flight);
                    }}
                  >
                    {/* Bande décorative en haut */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#2563eb]" />
                    
                    <div className="p-4">
                      {flight.itineraries.map((itinerary, itineraryIndex) => (
                        <div key={itineraryIndex} className={`${itineraryIndex === 1 ? 'mt-4 pt-4 border-t' : ''}`}>
                          {/* En-tête avec type de vol et compagnie */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Plane className="h-5 w-5 text-[#2563eb]" />
                              <span className="font-medium text-sm text-[#2563eb]">
                                {isOneWay ? 'Vol' : (itineraryIndex === 0 ? 'Aller' : 'Retour')}
                                {itinerary.segments.length > 1 && ` • ${itinerary.segments.length - 1} escale${itinerary.segments.length > 2 ? 's' : ''}`}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">Compagnie</div>
                              <div className="text-sm text-gray-600">
                                {carriers[itinerary.segments[0].carrierCode]}
                              </div>
                            </div>
                          </div>

                          {/* Informations principales du vol */}
                          <div className="flex items-center justify-between">
                            {/* Départ */}
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-1">Départ</div>
                              <div className="font-semibold">
                                {formatDateTime(itinerary.segments[0].departure.at)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {airportNames[itinerary.segments[0].departure.iataCode] || itinerary.segments[0].departure.iataCode}
                              </div>
                              {itinerary.segments[0].departure.terminal && (
                                <div className="text-sm text-gray-500">
                                  Terminal {itinerary.segments[0].departure.terminal}
                                </div>
                              )}
                            </div>

                            {/* Durée */}
                            <div className="flex flex-col items-center px-4">
                              <div className="text-sm font-medium mb-1">Durée</div>
                              <div className="text-sm text-gray-500">{formatDuration(itinerary.duration)}</div>
                              <div className="w-24 h-px bg-gray-200 my-2" />
                            </div>

                            {/* Arrivée */}
                            <div className="flex-1 text-right">
                              <div className="text-sm font-medium mb-1">Arrivée</div>
                              <div className="font-semibold">
                                {formatDateTime(itinerary.segments[itinerary.segments.length - 1].arrival.at)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {airportNames[itinerary.segments[itinerary.segments.length - 1].arrival.iataCode] || 
                                 itinerary.segments[itinerary.segments.length - 1].arrival.iataCode}
                              </div>
                              {itinerary.segments[itinerary.segments.length - 1].arrival.terminal && (
                                <div className="text-sm text-gray-500">
                                  Terminal {itinerary.segments[itinerary.segments.length - 1].arrival.terminal}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Prix, classe, bagages et bouton */}
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div>
                                Classe {flight.travelerPricings[0].fareDetailsBySegment[0].cabin}
                              </div>
                              <div>
                                {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags?.quantity 
                                  ? `${flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity} bagage(s) inclus`
                                  : 'Pas de bagage inclus'}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col items-end">
                                <div className="text-sm text-gray-500">
                                  {totalPassengers} passager{totalPassengers > 1 ? 's' : ''}
                                </div>
                                <div className="text-lg font-bold text-[#2563eb]">
                                  {formatPrice(calculateTotalPrice(flight.price.total), flight.price.currency)}
                                </div>
                              </div>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Select button clicked');
                                  handleFlightSelect(flight);
                                }}
                              >
                                Sélectionner
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {/* Contrôles de pagination */}
                <div className="flex justify-between items-center mt-6">
                  <Button 
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    variant="outline"
                  >
                    Page précédente
                  </Button>
                  <div className="text-sm text-gray-600">
                    Page {page} sur {totalPages}
                  </div>
                  <Button 
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    variant="outline"
                  >
                    Page suivante
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
