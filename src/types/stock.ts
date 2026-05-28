export interface StockInfo {
  id: number;
  symbol: string;
  name: string;
  exchange: string;
  industry: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WatchlistItem {
  id: number;
  stockId: number;
  symbol: string;
  name: string;
  exchange: string;
  industry: string;
  createdAt?: string;
}
