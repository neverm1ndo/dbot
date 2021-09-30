import { Router, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import { Twitch } from '@shared/twitch';
import { corsOpt } from '@shared/constants';

const { BAD_REQUEST } = StatusCodes;

const router = Router();

router.get('/', corsOpt, (req: Request, res: Response,) => {
  if (!req.query.channel) return res.sendStatus(BAD_REQUEST);
  Promise.all([
    Twitch.getBttvEmotes('channels/' + req.query.channel),
    Twitch.getBttvEmotes('emotes')
  ]).then(([channel, global]) => {
    res.send({channel: channel.data, global: global.data});
  }).catch((err) => {
    console.error(err)
    res.sendStatus(BAD_REQUEST)
  });
});

export default router;
