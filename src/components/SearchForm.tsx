import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PassengerSelector } from '@/components/PassengerSelector';
import axios from 'axios';

export const SearchForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    departureAirport: '',
    arrivalAirport: '',
    departureDate: '',
    returnDate: '',
    passengerCount: {
      adults: 1,
      children: 0,
      infants: 0
    },
    cabinClass: 'ECONOMY'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePassengerChange = (passengerCount: { adults: number; children: number; infants: number }) => {
    console.log('handlePassengerChange called with:', passengerCount);
    setFormData(prev => {
      const newData = {
        ...prev,
        passengerCount
      };
      console.log('New form data:', newData);
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Sending search request...');
      const searchData = {
        departureAirport: formData.departureAirport,
        arrivalAirport: formData.arrivalAirport,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        passengers: formData.passengerCount,
        cabinClass: formData.cabinClass
      };
      console.log('Search data:', searchData);
      const response = await axios.post('http://localhost:5001/api/flights/search', searchData);

      console.log('Search response:', response.data);
      
      if (response.data.success) {
        console.log('Navigating to results page...');
        navigate('/search-results', {
          state: { 
            searchResults: response.data.data,
            searchCriteria: searchData
          }
        });
      } else {
        setError('Erreur lors de la recherche de vols');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="departureAirport">Départ</Label>
          <Input
            id="departureAirport"
            name="departureAirport"
            placeholder="Ville ou aéroport"
            value={formData.departureAirport}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="arrivalAirport">Arrivée</Label>
          <Input
            id="arrivalAirport"
            name="arrivalAirport"
            placeholder="Ville ou aéroport"
            value={formData.arrivalAirport}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="departureDate">Date de départ</Label>
          <Input
            id="departureDate"
            name="departureDate"
            type="date"
            value={formData.departureDate}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="returnDate">Date de retour</Label>
          <Input
            id="returnDate"
            name="returnDate"
            type="date"
            value={formData.returnDate}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passengers">Passagers</Label>
          <PassengerSelector
            value={formData.passengerCount}
            onChange={handlePassengerChange}
          />
        </div>

        <div>
          <Label htmlFor="cabinClass">Classe</Label>
          <Select
            id="cabinClass"
            name="cabinClass"
            value={formData.cabinClass}
            onChange={handleChange}
          >
            <option value="ECONOMY">Économique</option>
            <option value="PREMIUM_ECONOMY">Premium Économique</option>
            <option value="BUSINESS">Affaires</option>
            <option value="FIRST">Première</option>
          </Select>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? 'Recherche...' : 'Rechercher'}
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </form>
  );
};
