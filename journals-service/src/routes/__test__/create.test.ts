import request from 'supertest';
import { app } from '../../app';
import { Market } from '../../models/market';
import { Journal } from '../../models/journal';

it('has a route handler listening to /api/journals for post requests', async () => {
  const response = await request(app).post('/api/journals').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/journals').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/journals')
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid market id is provided', async () => {
  await request(app)
    .post('/api/journals')
    .set('Cookie', global.signin())
    .send({
      marketId: ''
    })
    .expect(400);
});

it('returns an error if an invalid symbol is provided', async () => {
  await request(app)
    .post('/api/journals')
    .set('Cookie', global.signin())
    .send({
      symbol: ''
    })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  let journals = await Journal.find({});
  expect(journals.length).toEqual(0);

  const marketId = '1';
  const symbol = 'BTCUSD';

  const market = Market.build({ marketId, name: 'Crypto', userId: '1' });
  const marketSaved = await market.save();

  await request(app)
    .post('/api/journals')
    .set('Cookie', global.signin())
    .send({
      marketId,
      symbol
    })
    .expect(201);

  journals = await Journal.find({});
  expect(journals.length).toEqual(1);
  expect(journals[0].symbol).toEqual(symbol);
});
