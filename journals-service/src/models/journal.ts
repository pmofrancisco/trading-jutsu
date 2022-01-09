import mongoose from 'mongoose';
import { IJournalAttrs } from '@trading-jutsu/common';

// An interface that describes the properties
// that a Journal Model has
interface JournalModel extends mongoose.Model<JournalDoc> {
  build(attrs: IJournalAttrs): JournalDoc;
};

// An interface that describes the properties
// that a Journal Document has
interface JournalDoc extends IJournalAttrs, mongoose.Document {};

const journalSchema = new mongoose.Schema(
  {
    marketId: {
      type: String,
      required: true,
    },
    marketName: {
      type: String,
      required: true,
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

journalSchema.statics.build = (attrs: IJournalAttrs) => new Journal(attrs);

const Journal = mongoose.model<JournalDoc, JournalModel>('Journal', journalSchema);

export { Journal };
