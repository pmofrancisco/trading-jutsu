import express from 'express';
import { json } from 'body-parser';

import { errorHandler } from './middlewares/error-handler';
import { currentUserRouter } from './routes/current-user';
import { signupRouter } from './routes/signup';
import { NotFoundError } from './errors/not-found-error';

const app = express();
app.use(json());

app.use(currentUserRouter);
app.use(signupRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
