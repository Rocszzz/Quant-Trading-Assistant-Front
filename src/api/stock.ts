import request from '@/utils/request';
import type { StockInfo, WatchlistItem } from '@/types/stock';

interface AddWatchlistParams {
  stockId: number;
}

export const getWatchlist = async () => {
  return (await request.get('/watchlist')) as unknown as WatchlistItem[];
};

export const searchStocks = async (keyword: string) => {
  return (await request.get('/stocks/search', {
    params: {
      keyword
    }
  })) as unknown as StockInfo[];
};

export const addWatchlistItem = async (params: AddWatchlistParams) => {
  return (await request.post('/watchlist', params)) as unknown as WatchlistItem;
};

export const deleteWatchlistItem = async (id: number) => {
  await request.delete(`/watchlist/${id}`);
};
