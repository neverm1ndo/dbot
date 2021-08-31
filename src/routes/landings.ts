import { Router, Request, Response } from 'express';
import logger from '@shared/Logger';
import { USER } from '../schemas/user.schema';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  USER.findOne({'user.id': 144668618 }, (err: any, user: any) => {
    if (err) return logger.err(err, true);
    let commands = '';
    user.settings.sounds.forEach((element: {command: string, path: string}) => {
      commands = commands + '!' + element.command + '\n';
    });
    res.render('commands', { commands });
  })
});

export default router;
