import { Router, Request, Response } from 'express';
import { viewsDir } from '../Server';


const router = Router();

router.get('/', (req: Request, res: Response,) => {
  res.sendFile('speaker.html', { root: viewsDir });
});

export default router;
