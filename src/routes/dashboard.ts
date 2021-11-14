import { Router, Request, Response } from 'express';
import { checkSession } from '@shared/functions';

const router = Router();

router.get('/', checkSession, (req: Request, res: Response) => {
  res.set('Content-Security-Policy', 'default-src *')
     .render('dashboard', { session: req.session });
});

export default router;
