import { Subjects } from './subjects';

export interface MarketUpdatedEvent {
  subject: Subjects.MarketUpdated;
  data: {
    id: string;
    name: string;
    userId: string;
  };
};
