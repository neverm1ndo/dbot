import { Router, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import { Twitch } from '@shared/twitch';
import { corsOpt } from '@shared/constants';

const { BAD_REQUEST } = StatusCodes;

const router = Router();

router.get('/', corsOpt, (req: Request, res: Response,) => {
  Twitch.getBttvEmotes('channels/neverm1nd_o').then((data) => {
    res.send(data.data);
  }).catch((err) => {
    res.sendStatus(BAD_REQUEST)
  });
});

export default router;
