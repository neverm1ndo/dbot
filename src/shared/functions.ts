import logger from './Logger';
import crypto from 'crypto';
import { TWITCH_MESSAGE_ID, TWITCH_MESSAGE_TIMESTAMP } from '@shared/constants';

export const pErr = (err: Error) => {
    if (err) {
        logger.err(err);
    }
};

export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};
export const checkSession = ( req: any, res: any, next: any ) => {
    if (req.session.passport) next();
    else {
      res.redirect('/');
    }
}
export const checkUser = ( req: any, res: any, next: any ) => {
    if (req.user) next();
    else {
      res.sendStatus(401);
    }
}
export const verifySignature = (messageSignature: any, messageID: any, messageTimestamp: any, body: any) => {
    let message = messageID + messageTimestamp + body
    let signature = crypto.createHmac('sha256', process.env.TWITCH_EVENTSUB_SECRET!).update(message) // Remember to use the same secret set at creation
    let expectedSignatureHeader = "sha256=" + signature.digest("hex")

    return expectedSignatureHeader === messageSignature
}

export const rawBody = (req: any, res: any, next: any) => {
   var data = "";
   req.on('data', (chunk: any) => { data += chunk})
   req.on('end', () => {
      req.rawBody = data;
      next();
   })
}
export const getHmacMessage = (request:any) => {
    return (request.headers[TWITCH_MESSAGE_ID] +
        request.headers[TWITCH_MESSAGE_TIMESTAMP] +
        JSON.stringify(request.body));
}
export const getHmac = (secret: string, message: any) => {
    return crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex');
}
export const verifyMessage = (hmac: any, verifySignature: any) => {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
}
