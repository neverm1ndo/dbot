import { Router } from 'express';
import UserRouter from './user';
import SampRouter from './samp';
import { checkUser } from '@shared/functions';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/user', checkUser, UserRouter);
router.use('/samp', SampRouter);

// Export the base-router
export default router;
