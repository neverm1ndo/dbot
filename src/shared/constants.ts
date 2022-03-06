import cors from 'cors';

export const CORSoptions = {
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: (origin: any, callback: any) => {
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
      if(['https://localhost', /\.twitch\.tv$/, /\.betterttv\.net$/].indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    // origin: '*',
    preflightContinue: true,
  };
export const corsOpt = cors(CORSoptions);

export const HMAC_PREFIX = 'sha256=';

// Notification request headers
export const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id'.toLowerCase();
export const TWITCH_MESSAGE_TIMESTAMP = 'Twitch-Eventsub-Message-Timestamp'.toLowerCase();
export const TWITCH_MESSAGE_SIGNATURE = 'Twitch-Eventsub-Message-Signature'.toLowerCase();
export const MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type'.toLowerCase();

// Notification message types
export const MESSAGE_TYPE_VERIFICATION = 'webhook_callback_verification';
export const MESSAGE_TYPE_NOTIFICATION = 'notification';
export const MESSAGE_TYPE_REVOCATION = 'revocation';
