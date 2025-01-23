import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';

interface Hotel {
  hotel: {
    name: string;
    cityCode: string;
    address: {
      cityName: string;
      countryCode: string;
    };
  };
  offers: Array<{
    id: string;
    checkInDate: string;
    checkOutDate: string;
    price: {
      total: string;
      currency: string;
    };
    room: {
      type: string;
      description: string;
    };
  }>;
}

export const HotelsPage = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState('');

  useEffect(() => {
    // Charger des hôtels aléatoires au démarrage
    loadRandomHotels();
  }, []);

  const loadRandomHotels = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5001/api/hotels/random`);
      
      if (response.data.success) {
        setHotels(response.data.data);
      } else {
        setError('Erreur lors du chargement des hôtels');
      }
    } catch (err: any) {
      console.error('Error fetching random hotels:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const searchHotels = async () => {
    if (!cityName) {
      setError('Veuillez entrer un nom de ville');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5001/api/hotels/search?cityName=${encodeURIComponent(cityName)}`);
      
      if (response.data.success) {
        setHotels(response.data.data);
      } else {
        setError(response.data.error || 'Erreur lors de la recherche des hôtels');
      }
    } catch (err: any) {
      console.error('Error fetching hotels:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(parseFloat(price));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Recherche d'hôtels</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="cityName">Ville</Label>
              <Input
                id="cityName"
                placeholder="Ex: Paris, London, New York"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button
                onClick={searchHotels}
                disabled={loading}
                variant="default"
              >
                {loading ? 'Recherche...' : 'Rechercher'}
              </Button>
              <Button
                onClick={loadRandomHotels}
                disabled={loading}
                variant="outline"
              >
                Hôtels aléatoires
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 mt-2">{error}</div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">Chargement des hôtels...</div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-8">Aucun hôtel trouvé</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-2">{hotel.hotel.name}</h2>
                <p className="text-gray-600 mb-4">
                  {hotel.hotel.address.cityName}, {hotel.hotel.address.countryCode}
                </p>
                
                {hotel.offers.map((offer, offerIndex) => (
                  <div key={offer.id} className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{offer.room.type}</p>
                        <p className="text-sm text-gray-500">{offer.room.description}</p>
                      </div>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(offer.price.total, offer.price.currency)}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      Du {new Date(offer.checkInDate).toLocaleDateString()} au {new Date(offer.checkOutDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
