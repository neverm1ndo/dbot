import { Router, Request, Response } from 'express';
import logger from '@shared/Logger';
import { USER } from '../schemas/user.schema';
import StatusCodes from 'http-status-codes';
import { json } from 'express';
import { bot } from '@server';

const { BAD_REQUEST, OK, UNAUTHORIZED} = StatusCodes;

const router = Router();

router.get('/', (req: any, res: Response) => {
  if (!req.query.id) return res.sendStatus(BAD_REQUEST);
  if (req.query.id !== req.user.user.id) return res.sendStatus(UNAUTHORIZED);
  USER.findOne({'user.id': req.query.id }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.user);
  })
});
router.get('/automode-rules', (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.findOne({'user.login': req.user.user.login }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.settings.banwords);
  });
});
router.get('/moderators', (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.find({ 'settings.moderationUsersAllow.login': req.user.user.login }, (err: any, users: any) => {
    if (err) return logger.err(err, true);
    res.send(users.map((user: any) => user.user.login));
  });
});
router.post('/update-moderators', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.updateMany({ 'user.login': { $in: req.body.rules }},
  { 'user.settings.moderationUsersAllow': req.body.rules.map((mod: any) => { login: mod })},
  { upsert: true },
  (err: any) => {
    if (err) return logger.err(err, true);
    res.sendStatus(OK);
  });
});
router.get('/sounds', (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.findOne({'user.login': req.user.user.login }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.settings.sounds);
  });
});
router.get('/automessages', (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.findOne({'user.login': req.user.user.login }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.settings.automessages);
  });
});
router.get('/commands', (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.findOne({'user.login': req.user.user.login }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.settings.commands);
  });
});
router.post('/update-automessages', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.messages) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'user.login': req.user.user.login }, { 'settings.automessages': req.body.messages }, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
    bot.opts.schedules.automessages = req.body.messages;
    res.sendStatus(OK);
  });
});
router.post('/update-automode-rules', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.rules) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'user.login': req.user.user.login }, { 'settings.banwords': req.body.rules }, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    console.log(req.body.rules);
    if (err) return res.sendStatus(500);
    bot.opts.schedules.banwords = req.body.rules;
    res.sendStatus(OK);
  });
});
router.post('/update-sounds', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.sounds) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'accessToken': req.user.accessToken}, { 'settings.sounds': req.body.sounds }, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
    bot.opts.schedules.sounds = req.body.sounds;
    res.sendStatus(OK);
  });
});
router.post('/update-commands', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.commands) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'accessToken': req.user.accessToken}, { 'settings.commands': req.body.commands }, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
    bot.opts.schedules.commands = req.body.commands;
    res.sendStatus(OK);
  });
});

export default router;
