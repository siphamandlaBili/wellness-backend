import express from 'express';
import { login,register,logout,forgotPassword,resetPassword } from '../controllers/authControllers.js';

const router = express.Router();

router.post('/login',login)
router.post('/register',register)
router.post('/logout',logout);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password/:token',resetPassword);


export default router;