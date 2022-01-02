import request from 'supertest';
import { app } from '../../app';

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
  await request(app)
    .post('/api/journals')
    .set('Cookie', global.signin())
    .send({
      symbol: 'BTCUSD'
    })
    .expect(201);
});
