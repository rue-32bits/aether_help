import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { validateBody, registerSchema, loginSchema } from '../middleware/validateMiddleware.ts';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', authMiddleware, getMe);

export default router;
