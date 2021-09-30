import { Router, Request, Response } from 'express';
import logger from '@shared/Logger';
import { bot } from '@server';
import { corsOpt } from '@shared/constants';
import { MESSAGE } from '../schemas/message.schema';
import StatusCodes from 'http-status-codes';
import { Document } from 'mongoose';
import EmotesRoute from './bttv';
const { BAD_REQUEST } = StatusCodes;

const router = Router();

router.get('/', corsOpt, (req: Request, res: Response,) => {
  res.set("Content-Security-Policy", "default-src *");
  res.render('chat', { session: req.session, clientid: process.env.TWITCH_CLIENT_ID });
});
router.get('/lurkers', corsOpt, (req: Request, res: Response,) => {
  res.send(bot.opts.blacklist);
});
router.use('/emotes', EmotesRoute);
router.post('/add-lurker', corsOpt, (req: Request, res: Response,) => {
  bot.opts.blacklist.push(req.body);
});
router.get('/last', corsOpt, (req: Request, res: Response,) => {
  if (!req.query.channel) res.sendStatus(BAD_REQUEST);
  MESSAGE.find({ channel: '#' + req.query.channel }, [], { sort: {date: -1}, limit: 30 }, (err: any, messages: Document[]) => {
    if (err) return logger.err(err);
    res.send(messages.reverse());
  });
});

export default router;
