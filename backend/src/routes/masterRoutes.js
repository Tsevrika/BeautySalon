import { Router } from 'express';
import * as ctrl from '../controllers/masterController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', ctrl.getAll);

router.post('/', authMiddleware, roleMiddleware('admin'), ctrl.create);
router.put('/:id', authMiddleware, roleMiddleware('admin'), ctrl.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), ctrl.remove);
router.patch('/:id/restore', authMiddleware, roleMiddleware('admin'), ctrl.restore);
router.put('/:id/services', authMiddleware, roleMiddleware('admin'), ctrl.updateServices);
router.post( '/create-from-admin', authMiddleware, roleMiddleware('admin'), ctrl.createFromAdmin);

export default router;
