import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, requireAuth, validateRequest } from '@trading-jutsu/common';
import { Market } from '../models/market';
import { Journal } from '../models/journal';

const router = express.Router();

router.post(
  '/api/journals',
  requireAuth,
  [
    body('marketId').notEmpty().withMessage('You must supply a market id'),
    body('symbol').notEmpty().withMessage('You must supply a symbol')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { marketId, symbol } = req.body;

    const market = await Market.findOne({ marketId });
    if (!market) {
      throw new NotFoundError();
    }

    const journal = Journal.build({
      market, symbol, userId: req.currentUser?.id!,
    });
    await journal.save();
    res.status(201).send(journal);
  }
);

export { router as createJournalRouter };