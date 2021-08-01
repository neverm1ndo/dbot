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
    if (req.session.passport && (req.session.passport.user.data[0].login == JSON.parse(process.env.WHITELIST!)[0])) next();
    else {
      res.redirect('/');
    }
}
export const verifySignature = (messageSignature: any, messageID: any, messageTimestamp: any, body: any) => {
    let message = messageID + messageTimestamp + body
    let signature = crypto.createHmac('sha256', process.env.TWITCH_EVENTSUB_SECRET!).update(message) // Remember to use the same secret set at creation
    let expectedSignatureHeader = "sha256=" + signature.digest("hex")

    return expectedSignatureHeader === messageSignature
}
// export const verifySignature = (req: any, res: any, buf: any, encoding: any)=> {
//   const messageId = req.header("Twitch-Eventsub-Message-Id");
//   const timeStamp = req.header("Twitch-Eventsub-Message-Timestamp")
//   const messageSignature = req.header("Twitch-Eventsub-Message-Signature")
//
//   logger.info(`Message ${messageId} Signature: `,messageSignature)
//
//   const computedSignature = "sha256=" + crypto.createHmac("sha256", process.env.TWITCH_EVENTSUB_SECRET!).update(messageId + timeStamp + buf).digest("hex");
//
//   if (messageSignature !== computedSignature) {
//     logger.err(new Error("Invalid Signature."));
//   }
// }

export const rawBody = (req: any, res: any, next: any) => {
   var data = "";
   req.on('data', (chunk: any) => { data += chunk})
   req.on('end', () => {
      req.rawBody = data;
      next();
   })
}
