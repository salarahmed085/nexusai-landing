import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  deleteProject,
} from '../controllers/projectController.js';
import { validateProject } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', validateProject, createProject);
router.delete('/:id', deleteProject);

export default router;
