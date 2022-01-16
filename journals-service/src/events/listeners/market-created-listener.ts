import { Listener, Subjects, MarketCreatedEvent } from '@trading-jutsu/common';
import { Message } from 'node-nats-streaming';
import { Market } from '../../models/market';

export class MarketCreatedListener extends Listener<MarketCreatedEvent> {
  readonly subject = Subjects.MarketCreated;
  queueGroupName = 'journals-service';

  async onMessage(data: MarketCreatedEvent['data'], msg: Message) {
    const market = Market.build({ id: data.id, name: data.name, userId: data.userId });
    await market.save();
    msg.ack();
  }
};
