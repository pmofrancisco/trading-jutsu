import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@trading-jutsu/common';
import { createJournalRouter } from './routes/create';
import { getJournalByIdRouter } from './routes/get-by-id';

const app = express();
//app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: false,
  //secure: process.env.NODE_ENV !== 'test',
}));
app.use(currentUser);

app.use(createJournalRouter);
app.use(getJournalByIdRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
