import request from 'supertest';
import { app } from '../../app';
import { Market } from '../../models/market';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/markets for put requests', async () => {
  const response = await request(app).put('/api/markets').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).put('/api/markets').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .put('/api/markets')
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid name is provided', async () => {
  await request(app)
    .put('/api/markets')
    .set('Cookie', global.signin())
    .send({
      name: ''
    })
    .expect(400);
});

it('updates a market with valid inputs', async () => {
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

  const { id } = markets[0];
  const newName = 'Crypto Updated';

  await request(app)
    .put('/api/markets')
    .set('Cookie', global.signin())
    .send({ id, name: newName })
    .expect(200);

  markets = await Market.find({});
  expect(markets.length).toEqual(1);
  expect(markets[0].name).toEqual(newName);
});

it('publishes an event', async () => {
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

  const { id } = markets[0];
  const newName = 'Crypto Updated';

  await request(app)
    .put('/api/markets')
    .set('Cookie', global.signin())
    .send({ id, name: newName })
    .expect(200);

  markets = await Market.find({});
  expect(markets.length).toEqual(1);
  expect(markets[0].name).toEqual(newName);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
