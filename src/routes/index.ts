import { Router } from 'express';
import SpeakerRouter from './speaker';
// Init router and path
const router = Router();

// Add sub-routes
router.use('/speaker', SpeakerRouter);


// Export the base-router
export default router;
