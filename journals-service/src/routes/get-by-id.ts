import { NotAuthorizedError, NotFoundError } from '@trading-jutsu/common';
import express, { Request, Response } from 'express';
import { Journal } from '../models/journal';

const router = express.Router();

router.get('/api/journals/:id', async (req: Request, res: Response) => {
  const journal = await Journal.findById(req.params.id).populate('market');
  if (!journal) {
    throw new NotFoundError();
  }
  if (journal.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }
  res.send(journal);
});

export { router as getJournalByIdRouter };