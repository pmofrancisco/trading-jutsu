import { Listener, Subjects, MarketUpdatedEvent } from '@trading-jutsu/common';
import { Message } from 'node-nats-streaming';
import { Market } from '../../models/market';

export class MarketUpdatedListener extends Listener<MarketUpdatedEvent> {
  readonly subject = Subjects.MarketUpdated;
  queueGroupName = 'journals-service';

  async onMessage(data: { id: string, name: string, userId: string }, msg: Message) {
    console.log('data', data);
    const journal = await Market.findOne({ marketId: data.id, userId: data.userId });
    console.log('journal', journal);
    journal?.set({ name: data.name });
    await journal?.save();

    msg.ack();
  }
};
