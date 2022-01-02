import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@trading-jutsu/common';
import { Journal } from '../models/journal';

const router = express.Router();

router.post(
  '/api/journals',
  requireAuth,
  [
    body('market').notEmpty().withMessage('You must supply a market'),
    body('symbol').notEmpty().withMessage('You must supply a symbol')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { market, symbol } = req.body;
    const journal = Journal.build({ market, symbol, userId: req.currentUser?.id! });
    await journal.save();
    res.status(201).send(journal);
  }
);

export { router as createTicketRouter };