import logger from './Logger';

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
