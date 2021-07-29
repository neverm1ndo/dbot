import { Router, Request, Response } from 'express';
import logger from '@shared/Logger';
import { USER } from '../schemas/user.schema';
import StatusCodes from 'http-status-codes';
import { json } from 'express';

const { BAD_REQUEST, OK } = StatusCodes;

const router = Router();

router.get('/', (req: Request, res: Response) => {
  if (!req.query.id) return res.sendStatus(BAD_REQUEST);
  USER.findOne({'user.id': req.query.id }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    console.log(user);
    res.send(JSON.stringify(user));
  })
});
router.post('/update-settings', json(), (req: Request, res: Response) => {
  console.log(req.body)
  if (!req.body.settings) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'user.id': req.body.id }, { settings: req.body.settings }, { upsert: true, setDefaultsOnInsert: true } ,(err: any, user: any) => {
    if (err) return res.send;
    res.sendStatus(OK);
  });
});

export default router;
