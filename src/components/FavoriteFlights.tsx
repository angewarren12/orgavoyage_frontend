import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
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
    }>;
  }>;
}

interface FavoriteFlightsProps {
  currentFlight?: FlightOffer;
}

export const FavoriteFlights: React.FC<FavoriteFlightsProps> = ({ currentFlight }) => {
  const [favorites, setFavorites] = useState<FlightOffer[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Charger les favoris depuis le localStorage
    const savedFavorites = localStorage.getItem('favoriteFlights');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const saveFavorites = (newFavorites: FlightOffer[]) => {
    localStorage.setItem('favoriteFlights', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const addToFavorites = (flight: FlightOffer) => {
    if (!favorites.some(f => f.id === flight.id)) {
      const newFavorites = [...favorites, flight];
      saveFavorites(newFavorites);
      toast({
        title: "Vol ajouté aux favoris",
        description: "Vous pouvez retrouver ce vol dans votre liste de favoris.",
      });
    }
  };

  const removeFromFavorites = (flightId: string) => {
    const newFavorites = favorites.filter(f => f.id !== flightId);
    saveFavorites(newFavorites);
    toast({
      title: "Vol retiré des favoris",
      description: "Le vol a été supprimé de votre liste de favoris.",
    });
  };

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

  return (
    <div className="space-y-4">
      {currentFlight && (
        <Button
          onClick={() => addToFavorites(currentFlight)}
          className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#2563eb]/90"
        >
          <Heart className="w-4 h-4" />
          Ajouter aux favoris
        </Button>
      )}

      {favorites.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vols favoris</h3>
          {favorites.map((flight) => (
            <Card key={flight.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  {flight.itineraries.map((itinerary, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium text-gray-600">
                        {index === 0 ? 'Aller' : 'Retour'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{itinerary.segments[0].departure.iataCode}</span>
                        <span>→</span>
                        <span>
                          {itinerary.segments[itinerary.segments.length - 1].arrival.iataCode}
                        </span>
                        <span className="text-gray-500">
                          ({formatDuration(itinerary.duration)})
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(itinerary.segments[0].departure.at)}
                      </div>
                    </div>
                  ))}
                  <div className="font-bold text-[#2563eb]">
                    {flight.price.total} {flight.price.currency}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromFavorites(flight.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
