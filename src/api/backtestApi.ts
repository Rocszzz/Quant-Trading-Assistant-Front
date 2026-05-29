import request from '@/utils/request';
import type {
  BacktestRecord,
  BacktestRunPayload,
  BacktestTrade
} from '@/types/backtest';

export const runBacktest = async (payload: BacktestRunPayload) => {
  return (await request.post('/backtests/run', payload)) as unknown as BacktestRecord;
};

export const getBacktestRecords = async () => {
  return (await request.get('/backtests')) as unknown as BacktestRecord[];
};

export const getBacktestDetail = async (id: number | string) => {
  return (await request.get(`/backtests/${id}`)) as unknown as BacktestRecord;
};

export const getBacktestTrades = async (id: number | string) => {
  return (await request.get(`/backtests/${id}/trades`)) as unknown as BacktestTrade[];
};
