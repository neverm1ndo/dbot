import { Router, Request, Response } from 'express';
import logger from '@shared/Logger';
import { bot } from '@server';
import { corsOpt } from '@shared/constants';
import { MESSAGE } from '../schemas/message.schema';
import { USER } from '../schemas/user.schema';
import StatusCodes from 'http-status-codes';
import { Document } from 'mongoose';
import EmotesRoute from './bttv';
import refresh from 'passport-oauth2-refresh';

const { BAD_REQUEST, INTERNAL_SERVER_ERROR } = StatusCodes;
import { Twitch } from '@shared/twitch';

export interface IGetUserAuthInfoRequest extends Request {
  user?: any
}

const router = Router();

router.get('/', corsOpt, (req: IGetUserAuthInfoRequest, res: Response,) => {
  if (req.user) {
    Twitch.validateToken(req.user.accessToken)
    .then((validated) => {
      logger.info(req.user.data[0].login + ' have valid access token ( expires_in: ' + validated.data.expires_in + ' )');
      return req.user.accessToken;
    }).catch((err: Error) => {
      logger.warn(err);
      logger.warn('Users access token expired: ' + req.user.data[0].login);
      return new Promise((resolve, reject) => {
        refresh.requestNewAccessToken('twitch', req.user.refreshToken, (err: { data?: any, statusCode: number }, accessToken: string, refreshToken: string) => {
          if (err) { reject(err); }
          USER.updateOne({ 'user.id': req.user.data[0].id }, { accessToken, refreshToken }, { upsert: true }, () => {
            resolve(accessToken);
            logger.info(req.user.data[0].login + ' updated access token');
          });
        });
      })
    }).then((accessToken) => {
      res.cookie('nmnd_app_client_id', process.env.TWITCH_CLIENT_ID)
      .cookie('nmnd_user_access_token', accessToken)
      .cookie('nmnd_user_id', req.user.data[0].id)
      .cookie('nmnd_user_display_name', req.user.data[0].display_name)
      .cookie('nmnd_user_login', req.user.data[0].login)
      .set('Content-Security-Policy', 'default-src *')
      .render('chat', { user: req.user });
    }).catch((err) => {
      logger.err(err, true); res.sendStatus(INTERNAL_SERVER_ERROR).json(err);
    })
  } else {
    res.render('chat', { user: req.user });
  }
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
