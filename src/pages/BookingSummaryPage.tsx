import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plane, CreditCard, User, Calendar, Clock, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { airportLocationService } from '@/services/airportLocationService';
import { FlightDetails } from '@/components/FlightDetails';

interface PassengerInfo {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export const BookingSummaryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  useEffect(() => {
    // Vérification des paramètres requis
    console.log('Location state:', location.state);
    if (!location.state?.selectedFlight || !location.state?.carriers || !location.state?.numberOfPassengers) {
      console.error('Missing required parameters');
      navigate('/');
      return;
    }
  }, [location.state, navigate]);

  const selectedFlight = location.state?.selectedFlight;
  const carriers = location.state?.carriers;
  const numberOfPassengers = location.state?.numberOfPassengers || 1;
  
  console.log('Selected flight:', selectedFlight);
  console.log('Carriers:', carriers);
  console.log('Number of passengers:', numberOfPassengers);

  const [airportNames, setAirportNames] = useState<{ [key: string]: string }>({});

  // État pour gérer plusieurs passagers
  const [passengers, setPassengers] = useState<PassengerInfo[]>(() => {
    return Array(numberOfPassengers).fill(null).map(() => ({
      firstName: '',
      lastName: '',
      birthDate: '',
      email: '',
      phone: ''
    }));
  });

  useEffect(() => {
    const currentLength = passengers.length;
    if (currentLength < numberOfPassengers) {
      setPassengers([
        ...passengers,
        ...Array(numberOfPassengers - currentLength).fill(null).map(() => ({
          firstName: '',
          lastName: '',
          birthDate: '',
          email: '',
          phone: ''
        }))
      ]);
    } else if (currentLength > numberOfPassengers) {
      setPassengers(passengers.slice(0, numberOfPassengers));
    }
  }, [numberOfPassengers]);

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Fonction pour mettre à jour les informations d'un passager spécifique
  const handlePassengerChange = (index: number, field: keyof PassengerInfo, value: string) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setPassengers(updatedPassengers);
  };

  useEffect(() => {
    if (!selectedFlight || !carriers) {
      navigate('/');
      return;
    }
  }, [selectedFlight, carriers, navigate]);

  // Charger les noms des aéroports
  useEffect(() => {
    const loadAirportNames = async () => {
      if (!selectedFlight) return;
      
      // Collecter tous les codes IATA uniques
      const iataCodes = new Set<string>();
      selectedFlight.itineraries.forEach((itinerary: any) => {
        itinerary.segments.forEach((segment: any) => {
          iataCodes.add(segment.departure.iataCode);
          iataCodes.add(segment.arrival.iataCode);
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
  }, [selectedFlight]);

  if (!selectedFlight || !carriers) {
    return null;
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  const handleSubmit = async () => {
    // TODO: Implémenter la logique de soumission
    console.log('Réservation soumise:', { passengers, paymentInfo });
  };

  const calculateLayoverDuration = (currentSegment: any, nextSegment: any) => {
    const currentArrival = new Date(currentSegment.arrival.at);
    const nextDeparture = new Date(nextSegment.departure.at);
    const durationMs = nextDeparture.getTime() - currentArrival.getTime();
  
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  };

  const steps = [
    {
      title: "Détails du vol",
      icon: Plane,
      component: (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Plane className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Détails du vol</h2>
            </div>

            {/* Résumé du vol avec escales */}
            {selectedFlight.itineraries.map((itinerary: any, index: number) => (
              <div key={index} className={`${index === 1 ? 'mt-6 pt-6 border-t' : ''}`}>
                <div className="text-sm font-medium text-[#2563eb] mb-2 flex items-center">
                  <Plane className="h-4 w-4 mr-2" />
                  {index === 0 ? 'Vol aller' : 'Vol retour'}
                  {itinerary.segments.length > 1 && ` • ${itinerary.segments.length - 1} escale${itinerary.segments.length > 2 ? 's' : ''}`}
                </div>

                {/* Vol principal */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Départ</div>
                    <div className="font-semibold">
                      {formatDateTime(itinerary.segments[0].departure.at)}
                    </div>
                    <div className="text-gray-600">
                      {airportNames[itinerary.segments[0].departure.iataCode] || itinerary.segments[0].departure.iataCode}
                    </div>
                    {itinerary.segments[0].departure.terminal && (
                      <div className="text-sm text-gray-500">Terminal {itinerary.segments[0].departure.terminal}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-center px-6">
                    <div className="text-sm text-gray-500">
                      {formatDuration(itinerary.duration)}
                    </div>
                    <div className="w-32 h-px bg-gray-300 my-2" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-500">Arrivée</div>
                    <div className="font-semibold">
                      {formatDateTime(itinerary.segments[itinerary.segments.length - 1].arrival.at)}
                    </div>
                    <div className="text-gray-600">
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

                {/* Détails des escales */}
                {itinerary.segments.length > 1 && (
                  <div className="mt-6 space-y-4">
                    <div className="text-sm font-medium text-gray-500">Détails des escales</div>
                    {itinerary.segments.map((segment: any, segIndex: number) => (
                      <div key={segIndex} className="bg-gray-50 rounded-lg p-4">
                        {/* En-tête du segment */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-[#2563eb] rounded-full flex items-center justify-center text-white text-sm">
                              {segIndex + 1}
                            </div>
                            <div>
                              <div className="font-medium">{carriers[segment.carrierCode]}</div>
                              <div className="text-sm text-gray-500">Vol {segment.number}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="text-sm">{formatDuration(segment.duration)}</span>
                          </div>
                        </div>

                        {/* Informations de vol */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Départ */}
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500">Départ</div>
                            <div className="font-semibold">
                              {airportNames[segment.departure.iataCode] || segment.departure.iataCode}
                              {segment.departure.terminal && (
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                  Terminal {segment.departure.terminal}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDateTime(segment.departure.at)}
                            </div>
                          </div>

                          {/* Arrivée */}
                          <div className="space-y-1 text-right">
                            <div className="text-sm font-medium text-gray-500">Arrivée</div>
                            <div className="font-semibold">
                              {airportNames[segment.arrival.iataCode] || segment.arrival.iataCode}
                              {segment.arrival.terminal && (
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                  Terminal {segment.arrival.terminal}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDateTime(segment.arrival.at)}
                            </div>
                          </div>
                        </div>

                        {/* Indicateur d'escale */}
                        {segIndex < itinerary.segments.length - 1 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-500 flex items-center justify-center">
                              <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                Escale de {calculateLayoverDuration(segment, itinerary.segments[segIndex + 1])}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Informations supplémentaires */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                  <div>
                    Classe {selectedFlight.travelerPricings[0].fareDetailsBySegment[0].cabin}
                  </div>
                  <div>
                    {selectedFlight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags?.quantity 
                      ? `${selectedFlight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity} bagage(s) inclus`
                      : 'Pas de bagage inclus'}
                  </div>
                </div>
              </div>
            ))}

            {/* Prix total */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-600">Prix total</div>
                  <div className="text-sm text-gray-500">
                    Pour {numberOfPassengers} passager{numberOfPassengers > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#2563eb]">
                  {selectedFlight.price.total} {selectedFlight.price.currency}
                </div>
              </div>
            </div>

            {/* Détails complets du vol */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Détails complets</h3>
              <FlightDetails 
                flight={selectedFlight} 
                carriers={carriers}
                airportNames={airportNames}
                showTabs={true}
              />
            </div>
          </div>
        </Card>
      )
    },
    {
      title: "Informations passagers",
      icon: User,
      component: (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Informations passagers</h2>
              </div>
              <div className="text-sm text-gray-500">
                {numberOfPassengers} passager{numberOfPassengers > 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {passengers.map((passenger, index) => (
                <div key={index} className="pt-6 first:pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center mr-2">
                        {index + 1}
                      </span>
                      {index === 0 ? "Contact principal" : `Passager ${index + 1}`}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`firstName-${index}`}>Prénom</Label>
                      <Input
                        id={`firstName-${index}`}
                        value={passenger.firstName}
                        onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                        placeholder="Jean"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`lastName-${index}`}>Nom</Label>
                      <Input
                        id={`lastName-${index}`}
                        value={passenger.lastName}
                        onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                        placeholder="Dupont"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`birthDate-${index}`}>Date de naissance</Label>
                      <Input
                        id={`birthDate-${index}`}
                        type="date"
                        value={passenger.birthDate}
                        onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                        required
                      />
                    </div>
                    
                    {index === 0 && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={passenger.email}
                            onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                            placeholder="jean.dupont@email.com"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={passenger.phone}
                            onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                            placeholder="+33 6 12 34 56 78"
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )
    },
    {
      title: "Paiement",
      icon: CreditCard,
      component: (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Paiement</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Numéro de carte</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardName">Nom sur la carte</Label>
                <Input
                  id="cardName"
                  placeholder="JOHN DOE"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Date d'expiration</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/AA"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total à payer</span>
                <span>{selectedFlight.price.total} {selectedFlight.price.currency}</span>
              </div>
            </div>
          </div>
        </Card>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep > index + 1 ? 'bg-green-500' :
                      currentStep === index + 1 ? 'bg-blue-500' : 'bg-gray-300'
                    } text-white`}>
                      {currentStep > index + 1 ? <Check className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                    </div>
                    <span className="mt-2 text-sm font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      currentStep > index + 1 ? 'bg-green-500' :
                      currentStep === index + 2 ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="max-w-4xl mx-auto">
          {steps[currentStep - 1].component}
          
          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
            
            <Button
              onClick={currentStep === steps.length ? () => console.log('Réservation terminée!') : nextStep}
              className="flex items-center"
            >
              {currentStep === steps.length ? 'Confirmer la réservation' : 'Suivant'}
              {currentStep !== steps.length && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
