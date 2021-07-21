import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response,) => {
  res.render('dashboard', { session: req.session });
});

export default router;
