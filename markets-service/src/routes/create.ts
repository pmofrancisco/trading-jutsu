import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@trading-jutsu/common';

import { MarketCreatedPublisher } from '../events/publishers/market-created-publisher';
import { Market } from '../models/market';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/markets',
  requireAuth,
  [
    body('name').notEmpty().withMessage('You must supply a name'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const market = Market.build({
      name, userId: req.currentUser?.id!,
    });
    const marketSaved = await market.save();

    new MarketCreatedPublisher(natsWrapper.client).publish({
      id: marketSaved.id, name, userId: req.currentUser!.id
    });

    res.status(201).send(market);
  }
);

export { router as createMarketRouter };
