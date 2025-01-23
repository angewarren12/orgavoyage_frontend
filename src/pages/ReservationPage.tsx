import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FlightOffer } from '@/services/flightService';
import { Plane, MapPin, Calendar, DollarSign, User, ChevronRight, ShieldCheck, Clock, CreditCard } from 'lucide-react';
import { searchAirlines } from '@/services/autocompleteService';
import { SeatMap } from '@/components/SeatMap';

export const ReservationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const flight: FlightOffer = location.state?.flight;
  const [airlineName, setAirlineName] = useState<string>('');

  useEffect(() => {
    const fetchAirlineName = async () => {
      if (flight?.itineraries?.[0]?.segments?.[0]?.carrierCode) {
        const airlines = await searchAirlines(flight.itineraries[0].segments[0].carrierCode);
        if (airlines.length > 0) {
          setAirlineName(airlines[0].name);
        } else {
          setAirlineName(flight.itineraries[0].segments[0].carrierCode);
        }
      }
    };
    fetchAirlineName();
  }, [flight]);

  const [passengerDetails, setPassengerDetails] = useState({
    civilite: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    email: '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: ''
  });

  const [selectedSeats, setSelectedSeats] = useState({
    aller: '',
    retour: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [creditCardDetails, setCreditCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [paypalEmail, setPaypalEmail] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassengerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSeatSelection = (segment: 'aller' | 'retour', seat: string) => {
    setSelectedSeats(prev => ({
      ...prev,
      [segment]: seat
    }));
  };

  const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreditCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const reservationData = {
      ...passengerDetails,
      flightId: flight.id,
      selectedSeats,
      totalPrice: flight.price.total,
      paymentMethod,
      ...(paymentMethod === 'creditCard' ? { creditCardDetails } : {}),
      ...(paymentMethod === 'paypal' ? { paypalEmail } : {})
    };

    try {
      const response = await fetch('http://localhost:5000/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData)
      });

      if (response.ok) {
        const result = await response.json();
        navigate('/confirmation', { state: { reservation: result } });
      } else {
        const errorResult = await response.json();
        console.error('Erreur de réservation:', errorResult);
        alert('Une erreur est survenue lors de la réservation.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert('Impossible de se connecter au serveur.');
    }
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value);
  };

  // Récupérer les informations de la compagnie aérienne
  console.log('Flight Object:', JSON.stringify(flight));
  const carrierCode = flight.itineraries[0].segments[0].carrierCode;
  console.log('Carrier Code:', carrierCode);

  const airlineInfo = {
    name: airlineName,
    logo: `https://via.placeholder.com/100x100.png?text=${carrierCode}`
  };
  console.log('Airline Info:', JSON.stringify(airlineInfo));

  if (!flight) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Aucun vol sélectionné. Veuillez retourner à la page de recherche.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-12">
        {/* Fil d'Ariane */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          Accueil <ChevronRight size={16} className="mx-2" /> Recherche de vols <ChevronRight size={16} className="mx-2" /> Réservation
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Détails du vol */}
          <div className="lg:col-span-2 bg-white shadow-lg rounded-2xl p-8 border-t-4 border-primary">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-primary flex items-center">
                <Plane className="mr-3" /> Détails du vol
              </h2>
              <div className="flex items-center space-x-4">
                {airlineInfo.logo && (
                  <img 
                    src={airlineInfo.logo} 
                    alt={`Logo ${airlineInfo.name}`} 
                    className="h-10 w-auto"
                    onError={(e) => {
                      console.error('Logo load error:', e);
                      e.currentTarget.src = `https://via.placeholder.com/100x100.png?text=${carrierCode}`;
                    }}
                  />
                )}
                <span className="font-semibold">{airlineInfo.name}</span>
              </div>
            </div>
            
            {/* Vol Aller */}
            <div className="mb-8 bg-gray-100 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Vol Aller
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex justify-center items-center mb-2">
                    <MapPin className="mr-2 text-primary" />
                    <span className="font-semibold">Départ</span>
                  </div>
                  <p className="text-2xl font-bold">{flight.itineraries[0].segments[0].departure.iataCode}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(flight.itineraries[0].segments[0].departure.at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center items-center mb-2">
                    <Calendar className="mr-2 text-primary" />
                    <span className="font-semibold">Durée</span>
                  </div>
                  <p className="text-xl font-bold">{flight.itineraries[0].duration.replace('PT', '')}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center items-center mb-2">
                    <MapPin className="mr-2 text-primary" />
                    <span className="font-semibold">Arrivée</span>
                  </div>
                  <p className="text-2xl font-bold">{flight.itineraries[0].segments[0].arrival.iataCode}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(flight.itineraries[0].segments[0].arrival.at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Sélection de siège */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-primary">Choisissez votre siège (Aller)</h4>
                <SeatMap 
                  flightId={flight.id} 
                  segment="aller"
                  onSeatSelect={(seat) => handleSeatSelection('aller', seat)}
                  selectedSeat={selectedSeats.aller}
                />
              </div>
            </div>

            {/* Vol Retour */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Vol Retour
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex justify-center items-center mb-2">
                    <MapPin className="mr-2 text-primary" />
                    <span className="font-semibold">Départ</span>
                  </div>
                  <p className="text-2xl font-bold">{flight.itineraries[1].segments[0].departure.iataCode}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(flight.itineraries[1].segments[0].departure.at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center items-center mb-2">
                    <Calendar className="mr-2 text-primary" />
                    <span className="font-semibold">Durée</span>
                  </div>
                  <p className="text-xl font-bold">{flight.itineraries[1].duration.replace('PT', '')}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center items-center mb-2">
                    <MapPin className="mr-2 text-primary" />
                    <span className="font-semibold">Arrivée</span>
                  </div>
                  <p className="text-2xl font-bold">{flight.itineraries[1].segments[0].arrival.iataCode}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(flight.itineraries[1].segments[0].arrival.at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Sélection de siège */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-primary">Choisissez votre siège (Retour)</h4>
                <SeatMap 
                  flightId={flight.id} 
                  segment="retour"
                  onSeatSelect={(seat) => handleSeatSelection('retour', seat)}
                  selectedSeat={selectedSeats.retour}
                />
              </div>
            </div>
          </div>

          {/* Formulaire de réservation */}
          <div className="bg-white shadow-lg rounded-2xl p-8 border-t-4 border-primary">
            <div className="flex items-center mb-8">
              <User className="mr-3 text-primary" size={32} />
              <h2 className="text-2xl font-bold text-primary">Détails du passager</h2>
            </div>
            
            <form onSubmit={handleSubmitReservation} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="civilite" className="mb-2">Civilité</Label>
                  <select
                    id="civilite"
                    name="civilite"
                    value={passengerDetails.civilite}
                    onChange={(e) => handleInputChange(e as any)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Sélectionnez</option>
                    <option value="M">Monsieur</option>
                    <option value="Mme">Madame</option>
                    <option value="Mlle">Mademoiselle</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="dateNaissance" className="mb-2">Date de naissance*</Label>
                  <Input 
                    type="date" 
                    id="dateNaissance"
                    name="dateNaissance"
                    value={passengerDetails.dateNaissance}
                    onChange={handleInputChange}
                    className="w-full"
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom" className="mb-2">Nom*</Label>
                  <Input 
                    type="text" 
                    id="nom"
                    name="nom"
                    value={passengerDetails.nom}
                    onChange={handleInputChange}
                    placeholder="Votre nom"
                    className="w-full"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="prenom" className="mb-2">Prénom*</Label>
                  <Input 
                    type="text" 
                    id="prenom"
                    name="prenom"
                    value={passengerDetails.prenom}
                    onChange={handleInputChange}
                    placeholder="Votre prénom"
                    className="w-full"
                    required 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="mb-2">Email*</Label>
                <Input 
                  type="email" 
                  id="email"
                  name="email"
                  value={passengerDetails.email}
                  onChange={handleInputChange}
                  placeholder="Votre email"
                  className="w-full"
                  required 
                />
              </div>

              <div>
                <Label htmlFor="telephone" className="mb-2">Téléphone*</Label>
                <Input 
                  type="tel" 
                  id="telephone"
                  name="telephone"
                  value={passengerDetails.telephone}
                  onChange={handleInputChange}
                  placeholder="Votre numéro de téléphone"
                  className="w-full"
                  required 
                />
              </div>

              <div>
                <Label htmlFor="adresse" className="mb-2">Adresse</Label>
                <Input 
                  type="text" 
                  id="adresse"
                  name="adresse"
                  value={passengerDetails.adresse}
                  onChange={handleInputChange}
                  placeholder="Votre adresse"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codePostal" className="mb-2">Code Postal</Label>
                  <Input 
                    type="text" 
                    id="codePostal"
                    name="codePostal"
                    value={passengerDetails.codePostal}
                    onChange={handleInputChange}
                    placeholder="Code postal"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="ville" className="mb-2">Ville</Label>
                  <Input 
                    type="text" 
                    id="ville"
                    name="ville"
                    value={passengerDetails.ville}
                    onChange={handleInputChange}
                    placeholder="Ville"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Méthode de paiement */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-primary flex items-center">
                  <CreditCard className="mr-2" /> Méthode de paiement
                </h3>
                <div className="flex space-x-4 mb-6">
                  <Label 
                    htmlFor="creditCard" 
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input 
                      type="radio" 
                      id="creditCard" 
                      name="paymentMethod" 
                      value="creditCard"
                      checked={paymentMethod === 'creditCard'}
                      onChange={() => setPaymentMethod('creditCard')}
                      className="form-radio"
                    />
                    <span>Carte Bancaire</span>
                  </Label>
                  <Label 
                    htmlFor="paypal" 
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input 
                      type="radio" 
                      id="paypal" 
                      name="paymentMethod" 
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="form-radio"
                    />
                    <span>PayPal</span>
                  </Label>
                </div>

                {/* Formulaire Carte Bancaire */}
                {paymentMethod === 'creditCard' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardNumber">Numéro de carte</Label>
                      <Input 
                        type="text" 
                        id="cardNumber" 
                        name="cardNumber"
                        value={creditCardDetails.cardNumber}
                        onChange={handleCreditCardChange}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardHolder">Nom du titulaire</Label>
                      <Input 
                        type="text" 
                        id="cardHolder" 
                        name="cardHolder"
                        value={creditCardDetails.cardHolder}
                        onChange={handleCreditCardChange}
                        placeholder="Jean Dupont"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Date d'expiration</Label>
                      <Input 
                        type="text" 
                        id="expiryDate" 
                        name="expiryDate"
                        value={creditCardDetails.expiryDate}
                        onChange={handleCreditCardChange}
                        placeholder="MM/AA"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        type="text" 
                        id="cvv" 
                        name="cvv"
                        value={creditCardDetails.cvv}
                        onChange={handleCreditCardChange}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Formulaire PayPal */}
                {paymentMethod === 'paypal' && (
                  <div>
                    <Label htmlFor="paypalEmail">Adresse email PayPal</Label>
                    <Input 
                      type="email" 
                      id="paypalEmail" 
                      name="paypalEmail"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="votre-email@exemple.com"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 mt-6">
                <Checkbox id="conditions" required />
                <Label htmlFor="conditions" className="text-sm">
                  J'accepte les conditions générales*
                </Label>
              </div>

              <div className="mt-8">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={
                    !passengerDetails.nom || 
                    !passengerDetails.prenom || 
                    !selectedSeats.aller || 
                    !selectedSeats.retour || 
                    !paymentMethod ||
                    (paymentMethod === 'creditCard' && 
                      (!creditCardDetails.cardNumber || 
                       !creditCardDetails.cardHolder || 
                       !creditCardDetails.expiryDate || 
                       !creditCardDetails.cvv)) ||
                    (paymentMethod === 'paypal' && !paypalEmail)
                  }
                >
                  Confirmer la réservation
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600 mt-4">
                <ShieldCheck className="mx-auto mb-2 text-green-500" size={32} />
                Paiement 100% sécurisé
              </div>
            </form>
          </div>

          {/* Récapitulatif de la réservation */}
          <div className="bg-white shadow-lg rounded-2xl p-8 border-t-4 border-primary">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
              <ShieldCheck className="mr-3" /> Récapitulatif
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-semibold">Compagnie</span>
                <div className="flex items-center">
                  {airlineInfo.logo && (
                    <img 
                      src={airlineInfo.logo} 
                      alt={`Logo ${airlineInfo.name}`} 
                      className="h-8 w-auto mr-2"
                      onError={(e) => {
                        console.error('Logo load error:', e);
                        e.currentTarget.src = `https://via.placeholder.com/100x100.png?text=${carrierCode}`;
                      }}
                    />
                  )}
                  <span>{airlineInfo.name}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Prix du vol</span>
                <span>{flight.price.total} €</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Méthode de paiement</span>
                <span>
                  {paymentMethod === 'creditCard' ? 'Carte Bancaire' : 
                   paymentMethod === 'paypal' ? 'PayPal' : 'Non sélectionné'}
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{flight.price.total} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
