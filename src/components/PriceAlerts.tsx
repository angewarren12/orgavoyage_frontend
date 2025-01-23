import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Trash2 } from 'lucide-react';
import { usePriceAlerts } from '@/services/notificationService';

interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: Array<{
    segments: Array<{
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
    }>;
  }>;
}

interface PriceAlertsProps {
  flight?: FlightOffer;
}

export const PriceAlerts: React.FC<PriceAlertsProps> = ({ flight }) => {
  const [targetPrice, setTargetPrice] = useState('');
  const { addPriceAlert, removePriceAlert, getPriceAlerts } = usePriceAlerts();
  const alerts = getPriceAlerts();

  const handleAddAlert = () => {
    if (!flight || !targetPrice) return;

    const currentPrice = parseFloat(flight.price.total);
    const target = parseFloat(targetPrice);

    if (isNaN(target) || target >= currentPrice) return;

    addPriceAlert({
      flightId: flight.id,
      targetPrice: target,
      currentPrice: currentPrice,
      departure: flight.itineraries[0].segments[0].departure.iataCode,
      arrival: flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode,
      date: flight.itineraries[0].segments[0].departure.at,
    });

    setTargetPrice('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {flight && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Prix cible"
              className="flex-1"
            />
            <Button
              onClick={handleAddAlert}
              className="bg-[#2563eb] hover:bg-[#2563eb]/90"
              disabled={!targetPrice || parseFloat(targetPrice) >= parseFloat(flight.price.total)}
            >
              <Bell className="w-4 h-4 mr-2" />
              Créer une alerte
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Saisissez un prix inférieur au prix actuel ({flight.price.total} {flight.price.currency})
          </p>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Alertes prix actives</h3>
          {alerts.map((alert) => (
            <Card key={alert.flightId} className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {alert.departure} → {alert.arrival}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(alert.date)}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Prix actuel:</span>{' '}
                    <span className="font-medium">{alert.currentPrice}€</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-600">Prix cible:</span>{' '}
                    <span className="font-medium text-[#2563eb]">{alert.targetPrice}€</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePriceAlert(alert.flightId)}
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
