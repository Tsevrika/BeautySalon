import { Router } from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { login, register } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = Router();
router.post('/login', login);
router.post('/register', register);
router.post('/', authMiddleware, roleMiddleware('admin'), createService);
router.get('/', getServices);
router.get('/:id', getServiceById);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateService);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteService);

export default router;
