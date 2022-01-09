import { IId } from './base-models';

export interface IJournalAttrs {
  marketId: string;
  marketName: string;
  symbol: string;
  userId: string;
};

export interface IJournal extends IId, IJournalAttrs {};
