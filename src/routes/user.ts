import { Router, Request, Response } from 'express';
import logger from '@shared/Logger';
import { USER } from '../schemas/user.schema';
import StatusCodes from 'http-status-codes';

const { BAD_REQUEST, OK } = StatusCodes;

const router = Router();

router.get('/', (req: Request, res: Response) => {
  if (!req.params.id) return res.sendStatus(BAD_REQUEST);
  USER.findOne({'user.id': req.params.id }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(JSON.stringify(user));
  })
});
router.post('/update-settings', (req: Request, res: Response) => {
  if (!req.body.settings) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'user.id': req.params.id }, { settings: req.body.settings }, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.send;
    res.sendStatus(OK);
  });
});

export default router;
