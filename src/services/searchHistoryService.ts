interface SearchHistoryItem {
  id: string;
  departure: string;
  arrival: string;
  date: string;
  returnDate?: string;
  passengers: number | {
    adults: number;
    children: number;
    infants: number;
  };
  timestamp: number;
}

class SearchHistoryService {
  private static instance: SearchHistoryService;
  private history: SearchHistoryItem[] = [];
  private readonly MAX_HISTORY_ITEMS = 10;

  private constructor() {
    this.loadHistory();
  }

  public static getInstance(): SearchHistoryService {
    if (!SearchHistoryService.instance) {
      SearchHistoryService.instance = new SearchHistoryService();
    }
    return SearchHistoryService.instance;
  }

  private loadHistory() {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      this.history = JSON.parse(savedHistory);
    }
  }

  private saveHistory() {
    localStorage.setItem('searchHistory', JSON.stringify(this.history));
  }

  public addSearch(search: Omit<SearchHistoryItem, 'id' | 'timestamp'>) {
    const newSearch: SearchHistoryItem = {
      ...search,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };

    this.history.unshift(newSearch);

    // Garder seulement les 10 dernières recherches
    if (this.history.length > this.MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, this.MAX_HISTORY_ITEMS);
    }

    this.saveHistory();
  }

  public getHistory(): SearchHistoryItem[] {
    return this.history;
  }

  public clearHistory() {
    this.history = [];
    this.saveHistory();
  }

  public removeFromHistory(id: string) {
    this.history = this.history.filter(item => item.id !== id);
    this.saveHistory();
  }
}

export const searchHistoryService = SearchHistoryService.getInstance();
