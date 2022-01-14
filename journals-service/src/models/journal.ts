import mongoose from 'mongoose';
import { MarketDoc } from './market';

interface JournalAttrs {
  market: MarketDoc
  symbol: string;
  userId: string;
};

// An interface that describes the properties
// that a Journal Model has
interface JournalModel extends mongoose.Model<JournalDoc> {
  build(attrs: JournalAttrs): JournalDoc;
};

// An interface that describes the properties
// that a Journal Document has
interface JournalDoc extends JournalAttrs, mongoose.Document {};

const journalSchema = new mongoose.Schema(
  {
    market: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Market'
    },
    symbol: {
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

journalSchema.statics.build = (attrs: JournalAttrs) => new Journal(attrs);

const Journal = mongoose.model<JournalDoc, JournalModel>('Journal', journalSchema);

export { Journal };
