import logger from './Logger';
import crypto from 'crypto';
import refresh from 'passport-oauth2-refresh';
import StatusCodes from 'http-status-codes';
import { USER } from '../schemas/user.schema';
import { Twitch } from '@shared/twitch';
import { TWITCH_MESSAGE_ID, TWITCH_MESSAGE_TIMESTAMP } from '@shared/constants';
const { INTERNAL_SERVER_ERROR } = StatusCodes;

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

export const validateAccessToken = (req: any, res: any, next: any) => {
  if (!req.user) return next();
  if (!req.user.accessToken) return next();
  Twitch.validateToken(req.user.accessToken)
  .then((validated) => {
    logger.info(req.user.user.login + ' have valid access token ( expires_in: ' + validated.data.expires_in + ' )');
    return req.user.accessToken;
  }).catch((err: Error) => {
    logger.warn('Users access token expired: ' + req.user.user.login);
    logger.warn(err);
    return new Promise((resolve, reject) => {
      refresh.requestNewAccessToken('twitch', req.user.refreshToken, (err: { data?: any, statusCode: number }, accessToken: string, refreshToken: string) => {
        if (err) { reject(err); }
        USER.updateOne({ 'user.id': req.user.user.id }, { accessToken, refreshToken }, { upsert: true }, () => {
          resolve(accessToken);
          logger.info(req.user.user.login + ' updated access token');
        });
      });
    });
  }).then((accessToken) => {
    res.cookie('nmnd_app_client_id', process.env.TWITCH_CLIENT_ID)
       .cookie('nmnd_user_access_token', accessToken)
       .cookie('nmnd_user_id', req.user.user.id)
       .cookie('nmnd_user_display_name', req.user.user.display_name)
       .cookie('nmnd_user_login', req.user.user.login)
       .cookie('nmnd_user_avatar', req.user.user.profile_image_url);
    next();
  }).catch((err) => {
    logger.err(err, true); res.sendStatus(INTERNAL_SERVER_ERROR).json(err);
  });
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
