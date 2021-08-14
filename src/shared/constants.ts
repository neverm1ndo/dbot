import cors from 'cors';

export const CORSoptions = {
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: (origin: any, callback: any) => {
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
      if(['https://localhost', /\.twitch\.tv$/].indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    // origin: '*',
    preflightContinue: false,
  };
  export const corsOpt = cors(CORSoptions);
