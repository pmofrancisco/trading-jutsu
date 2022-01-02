import express from 'express';
import { requireAuth } from '@trading-jutsu/common';

const router = express.Router();

router.post('/api/journals', requireAuth, async (req, res) => {
  res.status(201).send({});
});

export { router as createTicketRouter };