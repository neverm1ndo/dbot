import { Router, Request, Response } from 'express';
import { bot } from '@server';
import { corsOpt } from '@shared/constants';

const router = Router();

router.get('/', corsOpt, (req: Request, res: Response,) => {
  res.set("Content-Security-Policy", "default-src *");
  res.render('chat', { session: req.session, clientid: process.env.TWITCH_CLIENT_ID });
});
router.get('/lurkers', corsOpt, (req: Request, res: Response,) => {
  res.send(bot.opts.blacklist);
});
router.post('/add-lurker', corsOpt, (req: Request, res: Response,) => {
  bot.opts.blacklist.push(req.body);
});

export default router;
