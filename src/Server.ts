import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';

import { join } from 'path';
import { connect } from 'mongoose';

import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';

import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import { Bot } from '@shared/bot.client';

import BaseRouter from './routes';
import APIRouter from './routes/api.routes';
import logger from '@shared/Logger';
import axios from 'axios';

import { USER } from './schemas/user.schema';

// import { verifySignature, rawBody } from '@shared/functions';

const app = express();
const { BAD_REQUEST, OK } = StatusCodes;

export const bot = new Bot();



/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: true,
  saveUninitialized: true
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

passport.deserializeUser(function(user: any, done) {
    done(null, user);
});

passport.use('twitch',  new OAuth2Strategy({
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
      refreshToken: accessToken,
    }, { upsert: true, setDefaultsOnInsert: true }, (err: any) => {
      if (err) return logger.err(err);
    });

    done(null, profile);
  }
));

// MongoDB connection
connect(process.env.MONGO!, { useNewUrlParser: true, useUnifiedTopology: true });

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

// Add APIs
app.use('/controls', BaseRouter);
app.use('/api', express.json(), APIRouter);

// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { scope: ['user_read', 'chat:read', 'chat:edit'] }));

// Set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/controls/chat', failureRedirect: '/controls/chat' }));

// Set route for webhooks
app.post('/webhooks/callback/streams', express.json({ verify: (req: any, res: any, buf: any) => { req.rawBody = buf }}), (req: any, res: Response) => {
    if (req.header("Twitch-Eventsub-Message-Type") === "webhook_callback_verification") {
      res.send(req.body.challenge) // Returning a 200 status with the received challenge to complete webhook creation flow
    } else if (req.header("Twitch-Eventsub-Message-Type") === "notification") {
      if (req.body.subscription.type == 'stream.online') bot.wakeup();
      if (req.body.subscription.type == 'stream.offline') bot.shutdown();
      res.status(OK).end();
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


bot.init();



/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

export const viewsDir = join(__dirname, 'views');
app.set('views', viewsDir);
export const staticDir = join(__dirname, 'public');
app.use(express.static(staticDir));

app.use('/.well-known/acme-challenge', express.static(join(__dirname, 'public/.well-known/acme-challenge')));
app.get('*', (req: Request, res: Response) => {
    res.render('index', { session: req.session });
});
// Export express instance
export default app;
