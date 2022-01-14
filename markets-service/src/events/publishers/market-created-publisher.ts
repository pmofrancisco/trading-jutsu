import { Publisher, Subjects, MarketCreatedEvent } from '@trading-jutsu/common';

export class MarketCreatedPublisher extends Publisher<MarketCreatedEvent> {
  readonly subject = Subjects.MarketCreated;
};
