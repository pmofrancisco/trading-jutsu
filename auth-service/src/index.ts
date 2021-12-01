import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import mongoose from 'mongoose';

import { errorHandler } from './middlewares/error-handler';
import { currentUserRouter } from './routes/current-user';
import { signupRouter } from './routes/signup';
import { NotFoundError } from './errors/not-found-error';

const app = express();
app.use(json());

app.use(currentUserRouter);
app.use(signupRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  try {
    await mongoose.connect(process.env.TradingJutsuAuthConnectionString!);
    console.log('Connected to MongoDB')
  } catch (err) {
    console.log(err);
  }
  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
