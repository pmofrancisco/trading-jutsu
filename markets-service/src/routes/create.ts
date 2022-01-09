import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@trading-jutsu/common';
import { Market } from '../models/market';

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
    await market.save();
    res.status(201).send(market);
  }
);

export { router as createMarketRouter };
