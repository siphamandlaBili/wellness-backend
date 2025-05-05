import express from 'express';
import { login,register,logout,forgotPassword,resetPassword,getAllUsers } from '../controllers/authControllers.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/login',login)
router.post('/register',register)
router.post('/logout',logout);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password/:token',resetPassword);
router.get('/all', protect, getAllUsers)

export default router;