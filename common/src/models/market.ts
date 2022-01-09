import { IId } from './base-models';

export interface IMarketAttrs {
  name: string;
  userId: string;
};

export interface IMarket extends IId, IMarketAttrs {};
