import mongoose from 'mongoose';
import { IMarketAttrs } from '@trading-jutsu/common';

// An interface that describes the properties
// that a Market Model has
interface MarketModel extends mongoose.Model<MarketDoc> {
  build(attrs: IMarketAttrs): MarketDoc;
};

// An interface that describes the properties
// that a Market Document has
interface MarketDoc extends IMarketAttrs, mongoose.Document {};

const marketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  }, {
    toJSON: {
      transform(doc, ret) {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

marketSchema.statics.build = (attrs: IMarketAttrs) => new Market(attrs);

const Market = mongoose.model<MarketDoc, MarketModel>('Market', marketSchema);

export { Market };
