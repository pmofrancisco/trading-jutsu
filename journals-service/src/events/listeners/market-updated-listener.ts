import { Listener, Subjects, MarketUpdatedEvent, IMarket } from '@trading-jutsu/common';
import { Message } from 'node-nats-streaming';
import { Journal } from '../../models/journal';

export class MarketUpdatedListener extends Listener<MarketUpdatedEvent> {
  readonly subject = Subjects.MarketUpdated;
  queueGroupName = 'journals-service';

  async onMessage(data: IMarket, msg: Message) {
    console.log('Event data!', data);

    console.log(data.id);
    console.log(data.name);
    console.log(data.userId);

    const journal = await Journal.findOne({ marketId: data.id, userId: data.userId });
    journal?.set({ marketName: data.name });
    await journal?.save();

    msg.ack();
  }
};
