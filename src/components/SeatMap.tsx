import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, MapPin } from 'lucide-react';

// Types de sièges
type SeatStatus = 'available' | 'occupied' | 'selected';

interface Seat {
  id: string;
  status: SeatStatus;
  type?: 'standard' | 'emergency' | 'premium';
}

interface SeatMapProps {
  flightId: string;
  segment: 'aller' | 'retour';
  onSeatSelect: (seat: string) => void;
  selectedSeat?: string;
}

export const SeatMap: React.FC<SeatMapProps> = ({ 
  flightId, 
  segment, 
  onSeatSelect, 
  selectedSeat 
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSeats, setShowSeats] = useState(false);

  // Générer une configuration de sièges réaliste
  const generateSeats = () => {
    const seatTypes = ['standard', 'emergency', 'premium'];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seatConfig: Seat[] = [];

    for (let row = 1; row <= 20; row++) {
      rows.forEach(letter => {
        const seatId = `${row}${letter}`;
        const seatType = row <= 3 ? 'premium' : 
                         row >= 18 ? 'emergency' : 
                         'standard';
        
        seatConfig.push({
          id: seatId,
          status: Math.random() < 0.3 ? 'occupied' : 'available',
          type: seatType
        });
      });
    }

    return seatConfig;
  };

  // Simuler un appel API pour récupérer les sièges
  const fetchSeats = async () => {
    try {
      setLoading(true);
      // Simulation d'un appel API
      const simulatedSeats = generateSeats();
      setSeats(simulatedSeats);
      setLoading(false);
      setShowSeats(true);
    } catch (err) {
      setError('Impossible de charger les sièges');
      setLoading(false);
    }
  };

  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === 'available') {
      onSeatSelect(seat.id);
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.id === selectedSeat) return 'bg-green-500 text-white';
    if (seat.status === 'occupied') return 'bg-red-500 text-white cursor-not-allowed';
    if (seat.status === 'available') return 'bg-gray-200 hover:bg-blue-200';
    return '';
  };

  return (
    <div className="seat-map-container">
      {!showSeats ? (
        <div className="text-center">
          <Button 
            onClick={fetchSeats} 
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <MapPin className="mr-2" /> Sélectionner un siège
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Sélection de siège - {segment === 'aller' ? 'Aller' : 'Retour'}</h3>
            <div className="flex justify-center space-x-4 mt-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 mr-2"></div>
                <span>Disponible</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 mr-2"></div>
                <span>Occupé</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 mr-2"></div>
                <span>Sélectionné</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            {/* Représentation de l'avant de l'avion */}
            <div className="w-full text-center text-sm text-gray-500 mb-4">
              ✈️ Avant de l'avion
            </div>

            {/* Grille de sièges */}
            <div className="grid grid-cols-6 gap-2 p-4 bg-gray-100 rounded-lg">
              {seats.map((seat) => (
                <Button
                  key={seat.id}
                  variant="outline"
                  className={`w-12 h-10 ${getSeatColor(seat)} 
                    ${seat.type === 'premium' ? 'border-2 border-gold-500' : ''} 
                    ${seat.type === 'emergency' ? 'border-2 border-red-500' : ''}`}
                  onClick={() => handleSeatSelect(seat)}
                  disabled={seat.status === 'occupied'}
                >
                  {seat.id}
                  {seat.id === selectedSeat && <Check className="ml-1" size={16} />}
                </Button>
              ))}
            </div>

            {/* Représentation de l'arrière de l'avion */}
            <div className="w-full text-center text-sm text-gray-500 mt-4">
              Arrière de l'avion ✈️
            </div>
          </div>
        </>
      )}
    </div>
  );
};
