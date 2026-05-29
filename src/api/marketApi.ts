import request from '@/utils/request';
import type {
  ImportMarketQuoteItem,
  ImportMarketQuotesResult,
  MarketKLineHistory,
  MarketQuote
} from '@/types/market';
import type { StockInfo } from '@/types/stock';

interface MarketHistoryParams {
  startDate?: string;
  endDate?: string;
}

export const getWatchlistMarketQuotes = async () => {
  return (await request.get('/market/quotes/watchlist')) as unknown as MarketQuote[];
};

export const getMarketQuote = async (symbol: string) => {
  return (await request.get(`/market/quotes/${symbol}/latest`)) as unknown as MarketQuote;
};

export const getStockBasicInfo = async (symbol: string) => {
  return (await request.get(`/stocks/${symbol}`)) as unknown as StockInfo;
};

export const getStockKLineHistory = async (symbol: string, params: MarketHistoryParams = {}) => {
  return (await request.get(`/market/quotes/${symbol}/history`, {
    params
  })) as unknown as MarketKLineHistory;
};

export const importMarketQuotes = async (quotes: ImportMarketQuoteItem[]) => {
  return (await request.post('/market/quotes/import', quotes)) as unknown as ImportMarketQuotesResult;
};
