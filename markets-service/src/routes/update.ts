import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  NotAuthorizedError, NotFoundError, requireAuth, validateRequest,
} from '@trading-jutsu/common';
import { Market } from '../models/market';

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

    res.send(market);
  }
);

export { router as updateMarketRouter };
