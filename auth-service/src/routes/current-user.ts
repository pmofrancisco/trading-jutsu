import express from 'express';

const router = express.Router();

router.get('/api/users/current-user', (req, res) => {
  res.send({ currentUser: "pmofrancisco" })
});

export { router as currentUserRouter };
