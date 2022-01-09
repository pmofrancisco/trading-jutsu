import request from 'supertest';
import { app } from '../../app';
import { Market } from '../../models/market';

it('has a route handler listening to /api/markets for post requests', async () => {
  const response = await request(app).post('/api/markets').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/markets').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/markets')
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid name is provided', async () => {
  await request(app)
    .post('/api/markets')
    .set('Cookie', global.signin())
    .send({
      name: ''
    })
    .expect(400);
});

it('creates a market with valid inputs', async () => {
  let markets = await Market.find({});
  expect(markets.length).toEqual(0);

  const name = 'Crypto';

  await request(app)
    .post('/api/markets')
    .set('Cookie', global.signin())
    .send({ name })
    .expect(201);

  markets = await Market.find({});
  expect(markets.length).toEqual(1);
  expect(markets[0].name).toEqual(name);
});
