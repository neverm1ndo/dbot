import { Router } from 'express';
import SpeakerRouter from './speaker';
import DashRouter from './dashboard';
// Init router and path
const router = Router();

// Add sub-routes
router.use('/speaker', SpeakerRouter);
router.use('/dash', DashRouter);


// Export the base-router
export default router;
