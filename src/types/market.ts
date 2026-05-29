export interface MarketQuote {
  symbol: string;
  tradeDate: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  preClosePrice: number;
  volume: number;
  amount: number;
  changeRate: number;
  ma5: number | null;
  ma10: number | null;
  ma20: number | null;
  klineValue: [number, number, number, number];
}

export interface MarketKLineHistory {
  symbol: string;
  dates: string[];
  values: [number, number, number, number][];
  volumes: number[];
  changeRates: number[];
  ma5: Array<number | null>;
  ma10: Array<number | null>;
  ma20: Array<number | null>;
  quotes: MarketQuote[];
}

export interface ImportMarketQuoteItem {
  symbol: string;
  tradeDate: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  preClosePrice: number;
  volume: number;
  amount: number;
  changeRate?: number;
}

export interface ImportMarketQuotesResult {
  importedCount: number;
}
