import { Router, Request, Response } from 'express';
import logger from '@shared/Logger';
import { USER } from '../schemas/user.schema';

const router = Router();

router.get('/:username', (req: Request, res: Response) => {
  USER.findOne({'user.login': req.params.username }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    res.set("Content-Security-Policy", "default-src *; img-src * 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src  'self' 'unsafe-inline' *")
       .render('commands', {
      sounds: user.settings.sounds,
      custom: user.settings.commands,
      user: {
        username: user.user.display_name,
        avatar: user.user.profile_image_url
      }
    });
  });
});

export default router;
