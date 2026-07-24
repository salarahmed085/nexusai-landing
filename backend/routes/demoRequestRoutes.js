import express from 'express';
import multer from 'multer';
import { createDemoRequest, getAllDemoRequests } from '../controllers/demoRequestController.js';
import { validateDemoRequest } from '../middleware/demoRequestValidation.js';
import { uploadAttachment } from '../middleware/upload.js';

const router = express.Router();

// Wrap multer so file errors (bad type / too large) come back as clean 400 JSON
const handleUpload = (req, res, next) => {
  uploadAttachment(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Attachment must be smaller than 5MB.'
        : err.message;
      return res.status(400).json({ success: false, errors: { attachment: message } });
    }
    if (err) {
      return res.status(400).json({ success: false, errors: { attachment: err.message } });
    }
    next();
  });
};

router.get('/', getAllDemoRequests);
router.post('/', handleUpload, validateDemoRequest, createDemoRequest);

export default router;
