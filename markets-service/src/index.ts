import mongoose from 'mongoose';
import { DatabaseConnectionError } from '@trading-jutsu/common';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  if (!process.env.TJ_JWT_KEY) {
    throw new Error('TJ_JWT_KEY must be defined');
  }
  if (!process.env.TJ_MARKET_MONGO_URI) {
    throw new Error('TJ_MARKET_MONGO_URI must be defined');
  }
  if (!process.env.TJ_MARKET_PORT) {
    throw new Error('TJ_MARKET_PORT must be defined');
  }
  if (!process.env.TJ_NATS_CLUSTER_ID) {
    throw new Error('TJ_NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.TJ_NATS_URL) {
    throw new Error('TJ_NATS_URL must be defined');
  }

  try {
    await natsWrapper.connect(process.env.TJ_NATS_CLUSTER_ID, 'markets-service', process.env.TJ_NATS_URL);
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());
  } catch (err) {
    console.error(err);
  }

  try {
    await mongoose.connect(process.env.TJ_MARKET_MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    throw new DatabaseConnectionError();
  }

  app.listen(process.env.TJ_MARKET_PORT, () => {
    console.log(`Listening on port ${process.env.TJ_MARKET_PORT}`);
  });
};

start();
