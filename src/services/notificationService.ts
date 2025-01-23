import { useToast } from "@/components/ui/use-toast";

interface PriceAlert {
  flightId: string;
  targetPrice: number;
  currentPrice: number;
  departure: string;
  arrival: string;
  date: string;
}

class NotificationService {
  private static instance: NotificationService;
  private priceAlerts: PriceAlert[] = [];

  private constructor() {
    this.loadAlerts();
    this.startPriceCheck();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadAlerts() {
    const savedAlerts = localStorage.getItem('priceAlerts');
    if (savedAlerts) {
      this.priceAlerts = JSON.parse(savedAlerts);
    }
  }

  private saveAlerts() {
    localStorage.setItem('priceAlerts', JSON.stringify(this.priceAlerts));
  }

  public addPriceAlert(alert: PriceAlert) {
    if (!this.priceAlerts.some(a => a.flightId === alert.flightId)) {
      this.priceAlerts.push(alert);
      this.saveAlerts();
    }
  }

  public removePriceAlert(flightId: string) {
    this.priceAlerts = this.priceAlerts.filter(a => a.flightId !== flightId);
    this.saveAlerts();
  }

  public getPriceAlerts(): PriceAlert[] {
    return this.priceAlerts;
  }

  private startPriceCheck() {
    // Vérifier les prix toutes les heures
    setInterval(() => {
      this.checkPrices();
    }, 60 * 60 * 1000);
  }

  private async checkPrices() {
    for (const alert of this.priceAlerts) {
      try {
        // Simuler une vérification de prix (à remplacer par un vrai appel API)
        const newPrice = Math.random() * alert.currentPrice;
        
        if (newPrice <= alert.targetPrice) {
          this.notifyPriceDecrease(alert, newPrice);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des prix:', error);
      }
    }
  }

  private notifyPriceDecrease(alert: PriceAlert, newPrice: number) {
    // Utiliser le système de notification du navigateur si disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Alerte prix vol', {
        body: `Le prix du vol ${alert.departure} → ${alert.arrival} a baissé à ${newPrice}€!`,
        icon: '/plane-icon.png'
      });
    }

    // Mettre à jour le prix actuel
    alert.currentPrice = newPrice;
    this.saveAlerts();
  }
}

export const notificationService = NotificationService.getInstance();

// Hook personnalisé pour gérer les alertes de prix
export const usePriceAlerts = () => {
  const { toast } = useToast();

  const addPriceAlert = (alert: PriceAlert) => {
    notificationService.addPriceAlert(alert);
    toast({
      title: "Alerte prix ajoutée",
      description: `Vous serez notifié si le prix du vol ${alert.departure} → ${alert.arrival} descend en dessous de ${alert.targetPrice}€`,
    });
  };

  const removePriceAlert = (flightId: string) => {
    notificationService.removePriceAlert(flightId);
    toast({
      title: "Alerte prix supprimée",
      description: "L'alerte de prix a été supprimée avec succès.",
    });
  };

  return {
    addPriceAlert,
    removePriceAlert,
    getPriceAlerts: notificationService.getPriceAlerts.bind(notificationService),
  };
};
