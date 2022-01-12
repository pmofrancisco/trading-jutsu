import { Publisher, Subjects, MarketUpdatedEvent } from '@trading-jutsu/common';

export class MarketUpdatedPublisher extends Publisher<MarketUpdatedEvent> {
  subject = Subjects.MarketUpdated;
};
