import { Publisher, Subjects, MarketUpdatedEvent } from '@trading-jutsu/common';

export class MarketUpdatedPublisher extends Publisher<MarketUpdatedEvent> {
  readonly subject = Subjects.MarketUpdated;
};
