export interface BacktestRunPayload {
  strategyId: number | string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCash: number;
}

export interface BacktestMetric {
  finalAsset: number;
  totalReturn: number;
  maxDrawdown: number;
  winRate: number;
  tradeCount: number;
}

export interface BacktestEquityPoint {
  date: string;
  asset: number;
  returnRate?: number;
}

export type BacktestTradeSide = 'BUY' | 'SELL';

export interface BacktestTrade {
  id: number | string;
  backtestId: number | string;
  symbol: string;
  tradeDate: string;
  side: BacktestTradeSide;
  price: number;
  quantity: number;
  amount: number;
  reason: string;
}

export interface BacktestRecord extends BacktestMetric {
  id: number | string;
  strategyId: number | string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCash: number;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | string;
  createdAt?: string;
}

export interface BacktestResult extends BacktestRecord {
  equityCurve: BacktestEquityPoint[];
  trades: BacktestTrade[];
}
