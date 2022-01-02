import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
  var signin: () => string[]
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = new MongoMemoryServer();
  await mongo.start();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: '1',
    email: 'test@test.com',
  };

  // Create the JWT.
  const token = jwt.sign(payload, process.env.TJ_JWT_KEY!);

  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn the session into JSON.
  const sessionJSON = JSON.stringify(session);

  // Take json and encode it as base64.
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // Return a string that contains the cookie with the encoded data.
  return [`express:sess=${base64}`];
};
