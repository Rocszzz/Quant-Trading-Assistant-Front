export type StrategyType = 'MA_CROSS' | 'MACD' | 'BREAKOUT';

export type StrategyParamType = 'NUMBER' | 'STRING' | 'BOOLEAN';

export interface StrategyParamItem {
  paramKey: string;
  paramValue: string;
  paramType: StrategyParamType;
  remark: string;
}

export interface StrategyItem {
  id: number | string;
  name: string;
  code: string;
  type: StrategyType;
  typeDescription?: string;
  description?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
  params?: StrategyParamItem[];
}

export interface StrategyPayload {
  name: string;
  code: string;
  type: StrategyType;
  description: string;
  enabled: boolean;
}

export interface CreateStrategyPayload extends StrategyPayload {
  params: StrategyParamItem[];
}

export interface SaveStrategyParamsPayload {
  params: StrategyParamItem[];
}

export interface DoubleMaParams {
  shortWindow: number;
  longWindow: number;
  positionRatio: number;
}

export interface MacdParams {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
}

export interface BreakoutParams {
  lookbackPeriod: number;
  breakoutRatio: number;
}

export type StrategyParams = DoubleMaParams | MacdParams | BreakoutParams;
