import multer from 'multer';
import { storage } from '../utils/cloudinary.js';

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export const uploadImage = (req, res, next) => {
  // Handle case where no image is uploaded
  const hasImage = req.headers['content-type']?.includes('multipart/form-data');
  
  if (hasImage) {
    return upload.single('image')(req, res, (err) => {
      handleUploadError(err, res, next);
    });
  }
  
  // No image upload, just process text fields
  return next();
};

function handleUploadError(err, res, next) {
  if (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
  next();
}