import { Router, Request, Response } from 'express';
import { bot } from '@server';

const router = Router();

router.get('/', (req: Request, res: Response,) => {
  res.render('chat', { session: req.session });
});
router.get('/lurkers', (req: Request, res: Response,) => {
  res.send(bot.opts.blacklist);
});

export default router;
