import express from 'express';

const router = express.Router();

router.post('/api/journals', async (req, res) => {
  res.status(201).send({});
});

export { router as createTicketRouter };