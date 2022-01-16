import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface MarketAttrs {
  id: string;
  name: string;
  userId: string;
};

// An interface that describes the properties
// that a Market Model has
interface MarketModel extends mongoose.Model<MarketDoc> {
  build(attrs: MarketAttrs): MarketDoc;
};

// An interface that describes the properties
// that a Market Document has
export interface MarketDoc extends mongoose.Document {
  name: string;
  userId: string;
  version: number;
};

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

marketSchema.set('versionKey', 'version');
marketSchema.plugin(updateIfCurrentPlugin);

marketSchema.statics.build = (attrs: MarketAttrs) => new Market({
  _id: attrs.id,
  name: attrs.name,
  userId: attrs.userId,
});

const Market = mongoose.model<MarketDoc, MarketModel>('Market', marketSchema);

export { Market };
