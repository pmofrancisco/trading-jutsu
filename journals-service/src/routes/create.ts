import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@trading-jutsu/common';

const router = express.Router();

router.post(
  '/api/journals',
  requireAuth,
  [
    body('symbol')
      .notEmpty()
      .withMessage('You must supply a symbol')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    res.status(201).send({});
  }
);

export { router as createTicketRouter };