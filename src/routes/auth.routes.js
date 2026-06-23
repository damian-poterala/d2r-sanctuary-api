import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

router.get('/me', authenticate, me);

export default router;