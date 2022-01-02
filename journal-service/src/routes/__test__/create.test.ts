import request from 'supertest';
import { app } from '../../app';

it('has a route handler listening to /api/journals for post requests', async () => {
  const response = await request(app).post('/api/journals').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/journals').send({}).expect(401);
});

it('returns an error if an invalid symbol is provided', async () => {});

it('creates a ticket with valid inputs', async () => {});
