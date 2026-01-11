import { Router } from 'express';
import * as ctrl from '../controllers/appointmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('user'), ctrl.create);
router.get('/my', authMiddleware, roleMiddleware('user'), ctrl.my);
router.get('/master', authMiddleware, roleMiddleware('master'), ctrl.master);
router.get('/admin', authMiddleware, roleMiddleware('admin'), ctrl.admin);
router.patch('/:id/cancel', authMiddleware, ctrl.cancel);
router.patch('/:id/done', authMiddleware, roleMiddleware('master', 'admin'), ctrl.markDone);

export default router;
