import express from 'express';
import multer from 'multer';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  uploadTaskAttachment,
  deleteTaskAttachment,
  getTaskStats
} from '../controllers/taskController.js';
import { validateTask } from '../middleware/validation.js';
import { uploadTaskFile } from '../middleware/upload.js';

const router = express.Router();

// Wrap multer so file errors (bad type / too large) come back as clean 400 JSON
// instead of an unhandled exception, matching the pattern used for demo requests.
const handleFileUpload = (req, res, next) => {
  uploadTaskFile(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Attachment must be smaller than 10MB.'
        : err.message;
      return res.status(400).json({ success: false, message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// IMPORTANT: /stats must be registered before /:id, otherwise Express treats
// "stats" as a task id and routes it to getTaskById instead.
router.get('/stats', getTaskStats);

router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', validateTask, createTask);
router.put('/:id', validateTask, updateTask);
router.delete('/:id', deleteTask);

router.post('/:id/attachment', handleFileUpload, uploadTaskAttachment);
router.delete('/:id/attachment', deleteTaskAttachment);

export default router;
