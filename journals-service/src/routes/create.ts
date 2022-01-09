import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@trading-jutsu/common';
import { Journal } from '../models/journal';

const router = express.Router();

router.post(
  '/api/journals',
  requireAuth,
  [
    body('marketId').notEmpty().withMessage('You must supply a market id'),
    body('marketName').notEmpty().withMessage('You must supply a market name'),
    body('symbol').notEmpty().withMessage('You must supply a symbol')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { marketId, marketName, symbol } = req.body;
    const journal = Journal.build({
      marketId, marketName, symbol, userId: req.currentUser?.id!,
    });
    await journal.save();
    res.status(201).send(journal);
  }
);

export { router as createTicketRouter };