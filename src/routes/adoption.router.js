import { Router } from 'express';
import adoptionsController from '../controllers/adoptions.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Get all adoptions (admin: all, user: own)
router.get('/', authMiddleware, adoptionsController.getAllAdoptions);
// Get a specific adoption
router.get('/:aid', authMiddleware, adoptionsController.getAdoption);
// Create an adoption
router.post('/:uid/:pid', authMiddleware, adoptionsController.createAdoption);
// Update adoption status (admin only)
router.put('/:aid', authMiddleware, adoptionsController.updateAdoptionStatus);

export default router;