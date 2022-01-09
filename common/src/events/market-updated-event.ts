import { IMarket } from '../models/market';
import { Subjects } from './subjects';

export interface MarketUpdatedEvent {
  subject: Subjects.MarketUpdated;
  data: IMarket;
};
