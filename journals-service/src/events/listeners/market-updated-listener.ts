import { Listener, Subjects, MarketUpdatedEvent } from '@trading-jutsu/common';
import { Message } from 'node-nats-streaming';
import { Market } from '../../models/market';

export class MarketUpdatedListener extends Listener<MarketUpdatedEvent> {
  readonly subject = Subjects.MarketUpdated;
  queueGroupName = 'journals-service';

  async onMessage(data: MarketUpdatedEvent['data'], msg: Message) {
    const market = await Market.findByEvent(data);

    if (!market) {
      throw new Error('Market not found');
    }

    market?.set({ name: data.name });
    await market?.save();

    msg.ack();
  }
};
