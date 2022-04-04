import { Router } from 'express';
import ChatRouter from './chat';
// Init router and path
const router = Router();

// Add sub-routes
router.use('/chat', ChatRouter);

// Export the base-router
export default router;
