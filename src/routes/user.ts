import { Router, Request, Response } from 'express';
import logger from '@shared/Logger';
import { USER } from '../schemas/user.schema';
import StatusCodes from 'http-status-codes';
import { json } from 'express';
import { Types } from 'mongoose';

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
  USER.updateMany({ 'user.settings.moderationUsersAllow.login': req.user.user.login },
  { 'user.settings.moderationUsersAllow': req.body.rules.map((mod: any) => { login: mod })},
  { upsert: true },
  (err: any) => {
    if (err) return logger.err(err, true);
    res.sendStatus(OK);
  });
});

router.get('/automessages', (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.findOne({'user.login': req.user.user.login }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.settings.automessages);
  });
});

router.post('/add-custom-announce', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.message) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'user.login': req.user.user.login }, { $push: { 'settings.automessages': req.body }}, { upsert: true, setDefaultsOnInsert: true }, (err: any) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(OK);
  });
});

router.patch('/patch-custom-announce', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.message) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'settings.automessages._id': new Types.ObjectId(req.body._id) }, { $set: { 'settings.automessages.$.message': req.body.message }}, {}, (err: any) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(OK);
  });
});

router.delete('/delete-custom-announce', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.message) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({ 'user.login': req.user.user.login }, { $pull: { 'settings.automessages': { _id: req.body._id }}}, {}, (err: any) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(OK);
  });
});

router.get('/commands', (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  USER.findOne({'user.login': req.user.user.login }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.send(user.settings.commands);
  });
});

router.post('/add-custom-command', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.command) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'accessToken': req.user.accessToken }, { $push: { 'settings.commands': req.body }}, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(OK);
  });
});

router.delete('/delete-custom-command', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.command) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({ 'accessToken': req.user.accessToken }, { $pull: { 'settings.commands':  { _id: req.body._id } }}, { } ,(err: any) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(OK);
  });
});
router.patch('/patch-custom-command', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.command) return res.sendStatus(BAD_REQUEST);
  console.log(req.body.command);
  USER.updateOne({ 'settings.commands._id': new Types.ObjectId(req.body._id) }, { $set: { 'settings.commands.$.command': req.body.command, 'settings.commands.$.response': req.body.response }}, {}, (err: any) => {
    if (err) {
      res.sendStatus(500);
      return logger.err(err);
    }
    res.sendStatus(OK);
  });
});

router.delete('/remove-automode-rule', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.rule) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'user.login': req.user.user.login }, { $pull: { 'settings.banwords':  req.body.rule }}, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(OK);
  });
});

router.post('/add-automode-rule', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.rule) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'user.login': req.user.user.login }, { $push: { 'settings.banwords': req.body.rule }}, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
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

router.post('/add-sound', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.command && !req.body.name) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'accessToken': req.user.accessToken}, { $push: { 'settings.sounds': req.body }}, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(OK);
  });
});

router.patch('/patch-sound', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.sounds) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({'accessToken': req.user.accessToken, 'settings.sounds._id': new Types.ObjectId(req.body._id) }, { $set: { 'settings.sounds.$._id': req.body }}, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(OK);
  });
});

router.delete('/delete-sound', json(), (req: any, res: Response) => {
  if (!req.cookies['nmnd_user_access_token']) return res.sendStatus(UNAUTHORIZED);
  if (!req.body.sounds) return res.sendStatus(BAD_REQUEST);
  USER.updateOne({ 'settings.sounds._id': new Types.ObjectId(req.body._id) }, { $pull: { 'settings.sounds': { _id: req.body._id } }}, { upsert: true, setDefaultsOnInsert: true } ,(err: any) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(OK);
  });
});

export default router;
