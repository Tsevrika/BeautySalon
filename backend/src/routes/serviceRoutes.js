import { Router } from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
} from '../controllers/serviceController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('admin'), createService);
router.get('/', getServices);
router.get('/:id', getServiceById);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateService);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteService);

export default router;
