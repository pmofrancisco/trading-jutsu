import { Subjects } from './subjects';

export interface MarketCreatedEvent {
  subject: Subjects.MarketCreated;
  data: {
    id: string;
    name: string;
    userId: string;
    version: number;
  };
};
