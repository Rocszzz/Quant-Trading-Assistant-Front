import request from '@/utils/request';
import type {
  CreateStrategyPayload,
  SaveStrategyParamsPayload,
  StrategyItem,
  StrategyPayload
} from '@/types/strategy';

export const getStrategies = async () => {
  return (await request.get('/strategies')) as unknown as StrategyItem[];
};

export const getStrategyDetail = async (id: number | string) => {
  return (await request.get(`/strategies/${id}`)) as unknown as StrategyItem;
};

export const createStrategy = async (payload: CreateStrategyPayload) => {
  return (await request.post('/strategies', payload)) as unknown as StrategyItem;
};

export const updateStrategy = async (id: number | string, payload: StrategyPayload) => {
  return (await request.put(`/strategies/${id}`, payload)) as unknown as StrategyItem;
};

export const deleteStrategy = async (id: number | string) => {
  return (await request.delete(`/strategies/${id}`)) as unknown as void;
};

export const saveStrategyParams = async (id: number | string, payload: SaveStrategyParamsPayload) => {
  return (await request.put(`/strategies/${id}/params`, payload)) as unknown as StrategyItem;
};
