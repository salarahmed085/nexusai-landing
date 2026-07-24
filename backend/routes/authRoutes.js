import express from 'express';
import multer from 'multer';
import { signup, login, getMe, updateAvatar } from '../controllers/authController.js';
import { validateSignup, validateLogin } from '../middleware/authValidation.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

// Wrap multer so file errors come back as clean 400 JSON
const handleAvatarUpload = (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Avatar must be smaller than 5MB.'
        : err.message;
      return res.status(400).json({ success: false, errors: { avatar: message } });
    }
    if (err) {
      return res.status(400).json({ success: false, errors: { avatar: err.message } });
    }
    next();
  });
};

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/me', requireAuth, getMe);
router.post('/avatar', requireAuth, handleAvatarUpload, updateAvatar);

export default router;
