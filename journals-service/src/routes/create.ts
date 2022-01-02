import express from 'express';
import { currentUser, requireAuth } from '@trading-jutsu/common';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/journals', async (req, res) => {
  const payload = jwt.verify(req.session?.jwt, process.env.TJ_JWT_KEY!)
  res.status(201).send(payload);
});

export { router as createTicketRouter };