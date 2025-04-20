import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { uploadImage } from '../middleware/uploadMiddleware.js'; // adjust the path if needed

const router = express.Router();

router.route('/')
    .get(protect, getProfile)
    .put(protect, uploadImage, updateProfile); // ✅ Add uploadImage here

export default router;
 