import { rateLimit } from '../middleware/rateLimit.js';
import express from 'express';
import { register, verifyOtp, resendOtp, login, getMe, updateProfile, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const limitAuth = rateLimit({ limit: 30 });
const limitEmail = rateLimit({ limit: 5 });

router.post('/register', limitEmail, register);
router.post('/verify-otp', limitAuth, verifyOtp);
router.post('/resend-otp', limitEmail, resendOtp);
router.post('/login', limitAuth, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);

export default router;
