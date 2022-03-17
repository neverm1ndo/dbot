import { Router, Request, Response } from 'express';
import logger from '@shared/Logger';
import { bot } from '@server';
import { corsOpt } from '@shared/constants';
import { validateAccessToken, checkSession } from '@shared/functions';
import { MESSAGE } from '../schemas/message.schema';
// import { USER } from '../schemas/user.schema';
import StatusCodes from 'http-status-codes';
import { Document } from 'mongoose';
import EmotesRoute from './bttv';
// import refresh from 'passport-oauth2-refresh';

const { BAD_REQUEST } = StatusCodes;
import { Twitch } from '@shared/twitch';

export interface IGetUserAuthInfoRequest extends Request {
  user?: any
}

const router = Router();

router.get('/', corsOpt, checkSession, validateAccessToken, (req: IGetUserAuthInfoRequest, res: Response,) => {
  res.set("Content-Security-Policy", "default-src *; img-src * data: 'self'; script-src-elem *; connect-src *")
     .render('chat', req.user);
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
router.get('/clip', corsOpt, (req: Request, res: Response,) => {
  if (!req.query.slug) res.sendStatus(BAD_REQUEST);
  Twitch.getClip(String(req.query.slug)).then( clip => {
    res.send(clip)
  }).catch(err => {
    console.error(err.message)
  })
});

export default router;
