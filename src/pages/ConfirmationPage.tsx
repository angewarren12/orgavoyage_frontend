import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reservation = location.state?.reservation;

  const handleReturnToSearch = () => {
    navigate('/');
  };

  if (!reservation) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Aucune réservation trouvée.</p>
        <Button onClick={handleReturnToSearch}>Retour à la recherche</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Réservation confirmée !</h1>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">Détails de la réservation</h2>
          <p><strong>Numéro de réservation :</strong> {reservation.reservation.id}</p>
          <p><strong>Nom :</strong> {reservation.reservation.nom} {reservation.reservation.prenom}</p>
          <p><strong>Email :</strong> {reservation.reservation.email}</p>
          <p><strong>Téléphone :</strong> {reservation.reservation.telephone}</p>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full bg-primary hover:bg-primary/90"
            onClick={handleReturnToSearch}
          >
            Retour à la recherche
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.print()}
          >
            Imprimer la confirmation
          </Button>
        </div>
      </div>
    </div>
  );
};
