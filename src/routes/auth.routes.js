import { Router } from 'express';
import { register, login, me, logout, refresh } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh)

router.get('/me', authenticate, me);

export default router;