import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Clock, Plane, Info, Cloud, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FlightDetailsProps {
  flight: any;
  carriers: { [key: string]: string };
  airportNames: { [key: string]: string };
  showTabs?: boolean;
}

export const FlightDetails: React.FC<FlightDetailsProps> = ({ 
  flight, 
  carriers,
  airportNames,
  showTabs = true  
}) => {
  if (!flight || !flight.travelerPricings || !flight.itineraries) {
    return <div>Aucun détail de vol disponible</div>;
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

  const getSegmentCarrier = (segment: any) => {
    if (!segment || !segment.carrierCode) return 'Compagnie inconnue';
    return carriers[segment.carrierCode] || segment.carrierCode;
  };

  const calculateLayoverTime = (arrivalTime: string, departureTime: string) => {
    const arrivalDate = new Date(arrivalTime);
    const departureDate = new Date(departureTime);
    const layoverTime = departureDate.getTime() - arrivalDate.getTime();
    const hours = Math.floor(layoverTime / (60 * 60 * 1000));
    const minutes = Math.floor((layoverTime % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="p-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="services">
          <AccordionTrigger className="text-lg font-medium">
            <div className="flex items-center">
              <Plane className="w-5 h-5 mr-2" />
              Services à bord
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              {flight.travelerPricings[0].fareDetailsBySegment.map((segment: any, index: number) => {
                const flightSegment = flight.itineraries[0]?.segments[index];
                const isLayover = index > 0;
                
                return (
                  <div key={index} className={`p-4 rounded-lg ${isLayover ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <h4 className="font-medium mb-2 flex items-center">
                      {isLayover ? (
                        <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm mr-2">
                          Escale {index}
                        </span>
                      ) : (
                        <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm mr-2">
                          Vol initial
                        </span>
                      )}
                      {flightSegment ? getSegmentCarrier(flightSegment) : 'Vol'}
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Classe: {segment.cabin || 'Non spécifié'}</li>
                      <li>• Bagages inclus: {segment.includedCheckedBags?.quantity || 0} bagage(s)</li>
                      <li>• Classe de réservation: {segment.class || 'Non spécifié'}</li>
                    </ul>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="conditions">
          <AccordionTrigger className="text-lg font-medium">
            <div className="flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Conditions tarifaires
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              <div className="text-sm text-gray-600">
                <h4 className="font-medium text-gray-900 mb-2">Conditions d'annulation</h4>
                <p>• Annulation possible jusqu'à 24h avant le départ</p>
                <p>• Frais d'annulation : 150€ par passager</p>
              </div>
              <div className="text-sm text-gray-600">
                <h4 className="font-medium text-gray-900 mb-2">Modification</h4>
                <p>• Modification possible jusqu'à 24h avant le départ</p>
                <p>• Frais de modification : 100€ par passager</p>
              </div>
              <div className="text-sm text-gray-600">
                <h4 className="font-medium text-gray-900 mb-2">Remboursement</h4>
                <p>• Remboursement partiel possible selon conditions</p>
                <p>• Taxes aéroportuaires remboursables</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="weather">
          <AccordionTrigger className="text-lg font-medium">
            <div className="flex items-center">
              <Cloud className="w-5 h-5 mr-2" />
              Météo à destination
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">Les informations météo seront disponibles prochainement.</p>
                <p>Nous travaillons à l'intégration d'un service météo pour vous fournir les prévisions à destination.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="airports">
          <AccordionTrigger className="text-lg font-medium">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Informations aéroports
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              {flight.itineraries[0].segments.map((segment: any, index: number) => {
                const isLayover = index > 0;
                const departureAirportName = airportNames[segment.departure.iataCode] || segment.departure.iataCode;
                const arrivalAirportName = airportNames[segment.arrival.iataCode] || segment.arrival.iataCode;

                return (
                  <div key={index} className={`p-4 rounded-lg ${isLayover ? 'bg-blue-50' : 'bg-gray-50'} space-y-4`}>
                    {isLayover && (
                      <div className="flex items-center mb-3">
                        <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm">
                          Escale {index}
                        </span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Départ</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium">{departureAirportName}</p>
                          <p>Code: {segment.departure.iataCode}</p>
                          {segment.departure.terminal && (
                            <p>Terminal: {segment.departure.terminal}</p>
                          )}
                          <p>Départ: {formatDateTime(segment.departure.at)}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Arrivée</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium">{arrivalAirportName}</p>
                          <p>Code: {segment.arrival.iataCode}</p>
                          {segment.arrival.terminal && (
                            <p>Terminal: {segment.arrival.terminal}</p>
                          )}
                          <p>Arrivée: {formatDateTime(segment.arrival.at)}</p>
                        </div>
                      </div>
                    </div>

                    {isLayover && index < flight.itineraries[0].segments.length - 1 && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="text-sm text-blue-600">
                          <Clock className="w-4 h-4 inline-block mr-1" />
                          Temps d'escale: {calculateLayoverTime(segment.arrival.at, flight.itineraries[0].segments[index + 1].departure.at)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {showTabs && (
        <Tabs defaultValue="baggage" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="baggage">Bagages</TabsTrigger>
            <TabsTrigger value="fare">Tarif</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="baggage" className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium mb-2">Bagages inclus</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>1 bagage cabine (max. 10kg)</li>
                <li>1 bagage en soute (max. 23kg)</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="fare" className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium mb-2">Conditions tarifaires</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Billet modifiable avec frais</li>
                <li>Billet remboursable avec frais</li>
                <li>Miles accumulables</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium mb-2">Services inclus</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Choix du siège standard</li>
                <li>Repas inclus</li>
                <li>Divertissement à bord</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
};
