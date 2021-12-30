import mongoose from 'mongoose';
import { DatabaseConnectionError } from '@trading-jutsu/common';
import { app } from './app';

const start = async () => {
  if (!process.env.TJ_JWT_KEY) {
    throw new Error('TJ_JWT_KEY must be defined');
  }
  if (!process.env.TJ_AUTH_CONNECTION_STRING) {
    throw new Error('TJ_AUTH_CONNECTION_STRING must be defined');
  }
  try {
    await mongoose.connect(process.env.TJ_AUTH_CONNECTION_STRING);
    console.log('Connected to MongoDB')
  } catch (err) {
    throw new DatabaseConnectionError();
  }
  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
