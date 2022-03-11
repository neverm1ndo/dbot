import { Router, Request, Response } from 'express';
import logger from '@shared/Logger';
import { USER } from '../schemas/user.schema';
import StatusCodes from 'http-status-codes';
import { json } from 'express';
import { bot } from '@server';

const { BAD_REQUEST, OK, UNAUTHORIZED} = StatusCodes;

const router = Router();

router.get('/', (req: Request, res: Response) => {
  if (!req.query.id) return res.sendStatus(BAD_REQUEST);
  USER.findOne({'user.id': req.query.id }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.user);
  })
});
router.get('/automode-rules', (req: Request, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.findOne({'user.login': req.cookies['nmnd_user_login']}, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.settings.banwords);
  });
});
router.get('/sounds', (req: Request, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.findOne({'user.login': req.cookies['nmnd_user_login']}, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.settings.sounds);
  });
});
router.get('/automessages', (req: Request, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.findOne({'accessToken': req.cookies['nmnd_user_access_token']}, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.settings.automessages);
  });
});
router.get('/commands', (req: Request, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.findOne({'accessToken': req.cookies['nmnd_user_access_token']}, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.settings.commands);
  });
});
router.post('/update-automessages', json(), (req: Request, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'accessToken': req.cookies['nmnd_user_access_token']}, { 'settings.automessages': req.body.messages }, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
    bot.opts.schedules.automessages = req.body.messages;
    res.sendStatus(OK);
  });
});
router.post('/update-automode-rules', json(), (req: Request, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  console.log(req.body);
  if (!req.body.rules) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'accessToken': req.cookies['nmnd_user_access_token']}, { 'settings.banwords': req.body.rules }, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    console.log(req.body.rules);
    if (err) return res.sendStatus(500);
    bot.opts.schedules.banwords = req.body.rules;
    res.sendStatus(OK);
  });
});
router.post('/update-sounds', json(), (req: Request, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'accessToken': req.cookies['nmnd_user_access_token']}, { 'settings.sounds': req.body.sounds }, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
    bot.opts.schedules.sounds = req.body.sounds;
    res.sendStatus(OK);
  });
});
router.post('/update-commands', json(), (req: Request, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'accessToken': req.cookies['nmnd_user_access_token']}, { 'settings.commands': req.body.commands }, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
    bot.opts.schedules.commands = req.body.commands;
    res.sendStatus(OK);
  });
});

export default router;
