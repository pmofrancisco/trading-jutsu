import { Subjects } from './subjects';

export interface MarketCreatedEvent {
  subject: Subjects.MarketCreated;
  data: {
    name: string;
    userId: string;
  };
};
