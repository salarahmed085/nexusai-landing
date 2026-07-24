import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ProjectModel from '../models/ProjectModel.js';
import TaskModel from '../models/TaskModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, '..', 'uploads');

export const getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectModel.getAll();
    res.status(200).json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects.', error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await ProjectModel.getById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch project.', error: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    let { key } = req.body;

    key = (key || name || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6);
    if (key.length < 2) {
      return res.status(400).json({ success: false, message: 'Project key must be at least 2 letters (derived from the name).' });
    }

    const existing = await ProjectModel.getByKey(key);
    if (existing) {
      return res.status(409).json({ success: false, message: `A project with key "${key}" already exists. Try a different name.` });
    }

    const project = {
      id: uuidv4(),
      name: name.trim(),
      key,
      description: (description || '').trim(),
      color: color || '#6366f1',
      createdAt: new Date().toISOString(),
    };

    const created = await ProjectModel.create(project);
    res.status(201).json({ success: true, message: 'Project created successfully.', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create project.', error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const existing = await ProjectModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Cascade: remove every ticket under this project, and any files they had attached.
    const deletedTasks = await TaskModel.deleteByProjectId(req.params.id);
    deletedTasks.forEach((task) => {
      if (task.attachmentPath) {
        const filePath = join(uploadDir, task.attachmentPath.replace('/uploads/', ''));
        fs.unlink(filePath, () => {});
      }
    });

    await ProjectModel.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Project and its tickets were deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete project.', error: err.message });
  }
};
