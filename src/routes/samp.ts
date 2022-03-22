import logger from '@shared/Logger';
import { Router, Request, Response } from 'express';
import Samp from '@shared/samp.query';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  if (!req.query.ip && !req.query.port) return res.sendStatus(401);
  let samp = new Samp(10000);
  const ip: string = req.query.ip!.toString();
  const port: number = Number(req.query.port!);
  samp.getServerInfo(ip, port).then((serverInfo) => {
    res.send(serverInfo);
  }).catch((err) => {
    logger.err(err, false);
    res.sendStatus(500);
  });
});

export default router;
