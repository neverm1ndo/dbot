import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';

import { join } from 'path';

import express, { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import { Bot } from '@shared/bot.client';
import { Schedule } from '@shared/bot.schedule';

import BaseRouter from './routes';
import logger from '@shared/Logger';

const app = express();
const { BAD_REQUEST } = StatusCodes;

const bot = new Bot({ schedule: new Schedule() });



/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// app.get('/', (res: Response, req: Request) => {
//   res.sendFile('speaker.html', { root: viewsDir });
// });


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

console.log()
app.use('/.well-known/acme-challenge', express.static(join(__dirname, 'public/.well-known/acme-challenge')));
app.get('/', (req: Request, res: Response) => {
    res.sendFile('index.html', {root: viewsDir});
});

// Export express instance
export default app;
