import React, { useState } from 'react';
import { FlightOffer } from "@/services/flightService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plane, Clock, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useNavigate } from 'react-router-dom';
import { findAirlineName } from "@/data/airlines";

interface FlightResultProps {
  flight: FlightOffer;
}

export const FlightResult = ({ flight }: FlightResultProps) => {
  const navigate = useNavigate();

  const formatDuration = (duration: string) => {
    return duration.replace("PT", "").toLowerCase();
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      time: format(date, "HH:mm"),
      date: format(date, "dd MMM", { locale: fr }),
    };
  };

  const handleReserveClick = () => {
    navigate('/reservation', { state: { flight } });
  };

  // Récupérer le code de la compagnie aérienne du premier segment
  const firstSegment = flight.itineraries[0].segments[0];
  const airlineCode = firstSegment.carrierCode;
  const airlineName = findAirlineName(airlineCode);

  return (
    <div className="relative bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vol Aller */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Plane className="rotate-45" size={20} />
            <span>Vol aller</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold">
                {formatDateTime(flight.itineraries[0].segments[0].departure.at).time}
              </div>
              <div className="text-sm text-gray-600">
                {flight.itineraries[0].segments[0].departure.iataCode}
              </div>
              <div className="text-xs text-gray-500">
                {formatDateTime(flight.itineraries[0].segments[0].departure.at).date}
              </div>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={14} />
                {formatDuration(flight.itineraries[0].duration)}
              </div>
              <div className="w-24 h-px bg-gray-300 my-2"></div>
              <div className="text-xs text-gray-500">
                <img 
                  src={`/airlines/${airlineCode}.png`} 
                  alt={`Logo ${airlineName}`} 
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/airlines/default.png';
                  }}
                />
                {airlineName}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatDateTime(flight.itineraries[0].segments[0].arrival.at).time}
              </div>
              <div className="text-sm text-gray-600">
                {flight.itineraries[0].segments[0].arrival.iataCode}
              </div>
              <div className="text-xs text-gray-500">
                {formatDateTime(flight.itineraries[0].segments[0].arrival.at).date}
              </div>
            </div>
          </div>
        </div>

        {/* Vol Retour */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Plane className="-rotate-45" size={20} />
            <span>Vol retour</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold">
                {formatDateTime(flight.itineraries[1].segments[0].departure.at).time}
              </div>
              <div className="text-sm text-gray-600">
                {flight.itineraries[1].segments[0].departure.iataCode}
              </div>
              <div className="text-xs text-gray-500">
                {formatDateTime(flight.itineraries[1].segments[0].departure.at).date}
              </div>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={14} />
                {formatDuration(flight.itineraries[1].duration)}
              </div>
              <div className="w-24 h-px bg-gray-300 my-2"></div>
              <div className="text-xs text-gray-500">
                <img 
                  src={`/airlines/${airlineCode}.png`} 
                  alt={`Logo ${airlineName}`} 
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/airlines/default.png';
                  }}
                />
                {airlineName}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatDateTime(flight.itineraries[1].segments[0].arrival.at).time}
              </div>
              <div className="text-sm text-gray-600">
                {flight.itineraries[1].segments[0].arrival.iataCode}
              </div>
              <div className="text-xs text-gray-500">
                {formatDateTime(flight.itineraries[1].segments[0].arrival.at).date}
              </div>
            </div>
          </div>
        </div>

        {/* Prix et réservation */}
        <div className="flex flex-col justify-center items-center space-y-4 border-l pl-4">
          <div className="text-3xl font-bold text-primary">
            {flight.price.total} €
          </div>
          <div className="text-sm text-gray-600">
            Compagnie: {airlineName}
          </div>
          <Button 
            className="w-full bg-primary hover:bg-primary/90"
            onClick={handleReserveClick}
          >
            Réserver
          </Button>
        </div>
      </div>
    </div>
  );
};