import { IId } from './base-models';

export interface IMarketAttrs {
  name: string;
};

export interface IMarket extends IId, IMarketAttrs {};
