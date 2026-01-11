import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getMe } from '../controllers/userController.js';

const router = Router();

router.get('/me', authMiddleware, getMe);

export default router;
