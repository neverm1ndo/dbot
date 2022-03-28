import { Router, Request, Response } from 'express';
import logger from '@shared/Logger';
import { USER } from '../schemas/user.schema';

const router = Router();

router.get('/:username', (req: Request, res: Response) => {
  USER.findOne({'user.login': req.params.username }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.render('commands', { sounds: user.settings.sounds, custom: user.settings.commands, username: req.params.username });
  })
});

export default router;
