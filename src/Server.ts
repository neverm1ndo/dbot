import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';

import { join } from 'path';
import { connect } from 'mongoose';

import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import refresh from 'passport-oauth2-refresh';
import OAuth2Strategy from 'passport-oauth2';

import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import { Bot } from '@shared/bot.client';

import BaseRouter from './routes';
import CommandsRouter from './routes/landings';
import APIRouter from './routes/api.routes';
import logger from '@shared/Logger';
import axios from 'axios';

import { USER } from './schemas/user.schema';
import { cm } from './routes/sockets';

import { getHmac, getHmacMessage, verifyMessage, validateAccessToken } from '@shared/functions';
import { HMAC_PREFIX, TWITCH_MESSAGE_SIGNATURE, MESSAGE_TYPE, MESSAGE_TYPE_NOTIFICATION, MESSAGE_TYPE_REVOCATION, MESSAGE_TYPE_VERIFICATION } from '@shared/constants';

// import { verifySignature, rawBody } from '@shared/functions';

const app = express();
const { BAD_REQUEST } = StatusCodes;

export const bot = new Bot();

// const useCors = cors();

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 525600*60000 }
}));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
  axios.get('https://api.twitch.tv/helix/users', {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  }).then((body) => {
    done(null, body.data);
  })
  .catch((body) => {
    done(JSON.parse(body));
  });
}

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(u: any, done) {
  USER.findOne({ 'user.id': u.id }, function(err: any, user: any) {
    if (err) logger.err(err);
    done(null, {
      user: user.user,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  });
});

const strategy = new OAuth2Strategy({
    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: process.env.TWITCH_CLIENT_ID!,
    clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    callbackURL: process.env.TWITCH_AUTH_CALLBACK!,
    state: true
  },
  (accessToken: any, refreshToken: any, profile: any, done: any) => {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;

    USER.updateOne({ 'user.id': profile.data[0].id }, {
      user: profile.data[0],
      accessToken: accessToken,
      refreshToken: refreshToken,
    }, { upsert: true, setDefaultsOnInsert: true }, (err: any) => {
      if (err) return logger.err(err);
      done(null, profile.data[0]);
    });
  });
passport.use('twitch',  strategy);
refresh.use('twitch', strategy);

// MongoDB connection
connect(process.env.MONGO!, { useNewUrlParser: true, useUnifiedTopology: true });

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));


// Security
if (process.env.NODE_ENV === 'production') app.use(helmet());

// Add APIs
app.use('/controls', BaseRouter);
app.use('/commands', CommandsRouter);
app.use('/api', express.json(), APIRouter);

// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { scope: ['user_read', 'user_subscriptions', 'channel_editor','chat:read', 'chat:edit', 'channel:moderate'] }));

// Set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch',
{
  successRedirect: '/',
  failureRedirect: '/'
}));

// Set route for webhooks
app.use('/webhooks/callback/streams', express.raw({
    type: 'application/json'
}));
app.post('/webhooks/callback/streams', (req: any, res: Response) => {
    const secret = process.env.TWITCH_EVENTSUB_SECRET!;
    const message = getHmacMessage(req);
    const hmac = HMAC_PREFIX + getHmac(secret, message);
    console.log(secret, hmac)
    console.log(req.headers[TWITCH_MESSAGE_SIGNATURE]);

    if (true === verifyMessage(hmac, req.headers[TWITCH_MESSAGE_SIGNATURE])) {
        logger.imp("Message signatures match");
        let notification = req.body;

        if (MESSAGE_TYPE_NOTIFICATION === req.headers[MESSAGE_TYPE]) {
            logger.imp(notification.subscription.type);
            switch (notification.subscription.type) {
              case 'stream.online': {
                bot.wakeup();
                break;
              };
              case 'stream.offline': {
                bot.shutdown();
                break;
              };
              default: break;
            }
            cm.sendall({ event: notification.subscription.type, msg: req.body.event });
            res.sendStatus(204);
        }
        else if (MESSAGE_TYPE_VERIFICATION === req.headers[MESSAGE_TYPE]) {
            res.status(200).send(notification.challenge);
        }
        else if (MESSAGE_TYPE_REVOCATION === req.headers[MESSAGE_TYPE]) {
            res.sendStatus(204);
            logger.info(`${notification.subscription.type} notifications revoked!`);
            logger.info(`reason: ${notification.subscription.status}`);
            logger.info(`condition: ${JSON.stringify(notification.subscription.condition, null, 4)}`);
        }
        else {
            res.sendStatus(204);
            logger.warn(`Unknown message type: ${req.headers[MESSAGE_TYPE]}`);
        }
    }
    else {
      logger.err("Signatures didn't match: 403");    // Signatures didn't match.
      res.sendStatus(403);
    }
});

// Print API errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.err(err, true);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});

// Init tmi.js client
bot.init();



/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

export const viewsDir = join(__dirname, 'views');
app.set('views', viewsDir);
export const staticDir = join(__dirname, 'public');
app.use(express.static(staticDir));

app.use('/.well-known/acme-challenge', express.static(join(__dirname, 'public/.well-known/acme-challenge')));
app.get('/', validateAccessToken, (req: any, res: Response) => {
  if (req.session.passport) {
    res.set("Content-Security-Policy", "default-src *; img-src * data: 'self'")
       .render('dashboard', { session: req.session });
    return;
  }
  res.set("Content-Security-Policy", "default-src *")
     .render('index', { user: req.user });
});
app.get('*', (req: Request, res: Response) => {
  res.sendStatus(404);
});

// Export express instance
export default app;
