import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, ArrowRight, Trash2, Users } from 'lucide-react';
import { searchHistoryService } from '@/services/searchHistoryService';
import { useToast } from "@/components/ui/use-toast";

export const SearchHistory: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const history = searchHistoryService.getHistory();

  const handleClearHistory = () => {
    searchHistoryService.clearHistory();
    toast({
      title: "Historique effacé",
      description: "Votre historique de recherche a été effacé avec succès.",
    });
  };

  const handleRemoveItem = (id: string) => {
    searchHistoryService.removeFromHistory(id);
    toast({
      title: "Recherche supprimée",
      description: "La recherche a été supprimée de l'historique.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Il y a moins d\'une heure';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const handleRepeatSearch = (search: any) => {
    navigate('/search-results', {
      state: {
        searchParams: {
          departure: search.departure,
          arrival: search.arrival,
          date: search.date,
          returnDate: search.returnDate,
          passengers: search.passengers,
        }
      }
    });
  };

  if (history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Aucune recherche récente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Recherches récentes</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearHistory}
          className="text-gray-500 hover:text-gray-700"
        >
          Effacer l'historique
        </Button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.departure}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{item.arrival}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div>
                    {formatDate(item.date)}
                    {item.returnDate && ` - ${formatDate(item.returnDate)}`}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {typeof item.passengers === 'object' 
                      ? `${(item.passengers as any).adults + (item.passengers as any).children + (item.passengers as any).infants} passagers`
                      : `${item.passengers} passagers`}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {formatTimestamp(item.timestamp)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleRepeatSearch(item)}
                  size="sm"
                  className="bg-[#2563eb] hover:bg-[#2563eb]/90"
                >
                  Rechercher
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
