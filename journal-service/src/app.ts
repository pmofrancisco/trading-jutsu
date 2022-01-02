import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError } from '@trading-jutsu/common';
import { createTicketRouter } from './routes/create';

const app = express();
//app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: false,
  //secure: process.env.NODE_ENV !== 'test',
}));

app.use(createTicketRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
