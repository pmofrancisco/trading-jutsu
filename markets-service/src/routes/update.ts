import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  NotAuthorizedError, NotFoundError, requireAuth, validateRequest,
} from '@trading-jutsu/common';

import { MarketUpdatedPublisher } from '../events/publishers/market-updated-publisher';
import { Market } from '../models/market';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/markets',
  requireAuth,
  [
    body('id').notEmpty().withMessage('You must supply an id'),
    body('name').notEmpty().withMessage('You must supply a name'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id, name } = req.body;
    const market = await Market.findById(id);

    if (!market) {
      throw new NotFoundError();
    }

    if (market.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    market.set({ name });
    await market.save();

    new MarketUpdatedPublisher(natsWrapper.client).publish({
      id: market.id,
      name: market.name,
      userId: req.currentUser!.id,
      version: market.version,
    });

    res.send(market);
  }
);

export { router as updateMarketRouter };
