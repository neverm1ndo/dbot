import logger from './Logger';
import crypto from 'crypto';
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
export const verifySignature = (messageSignature: any, messageID: any, messageTimestamp: any, body: any) => {
    let message = messageID + messageTimestamp + body
    let signature = crypto.createHmac('sha256', process.env.TWITCH_CLIENT_SECRET!).update(message) // Remember to use the same secret set at creation
    let expectedSignatureHeader = "sha256=" + signature.digest("hex")

    return expectedSignatureHeader === messageSignature
}
