import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import TaskModel from '../models/TaskModel.js';
import ProjectModel from '../models/ProjectModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, '..', 'uploads');

export const getAllTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const tasks = await TaskModel.getAll({ projectId });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks.', error: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await TaskModel.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch task.', error: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description = '', status = 'Pending', priority = 'Medium', projectId } = req.body;

    let ticketKey = null;
    if (projectId) {
      const project = await ProjectModel.getById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
      const counter = await ProjectModel.incrementCounter(projectId);
      ticketKey = `${project.key}-${counter}`;
    }

    const newTask = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      createdAt: new Date().toISOString(),
      projectId: projectId || null,
      ticketKey,
    };

    const task = await TaskModel.create(newTask);
    res.status(201).json({ success: true, message: 'Task created successfully.', data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create task.', error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const existing = await TaskModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.description !== undefined) updates.description = req.body.description.trim();
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.priority !== undefined) updates.priority = req.body.priority;

    const updated = await TaskModel.update(req.params.id, updates);
    res.status(200).json({ success: true, message: 'Task updated successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update task.', error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const existing = await TaskModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await TaskModel.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete task.', error: err.message });
  }
};

export const uploadTaskAttachment = async (req, res) => {
  try {
    const existing = await TaskModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded.' });
    }

    // Remove the previous attachment from disk (if any) before saving the new one.
    if (existing.attachmentPath) {
      const oldPath = join(uploadDir, existing.attachmentPath.replace('/uploads/', ''));
      fs.unlink(oldPath, () => {}); // best-effort, ignore errors
    }

    const attachment = {
      path: `/uploads/${req.file.filename}`,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
    };

    await TaskModel.setAttachment(req.params.id, attachment);
    res.status(200).json({
      success: true,
      message: 'Attachment uploaded successfully.',
      data: {
        attachmentPath: attachment.path,
        attachmentName: attachment.name,
        attachmentType: attachment.type,
        attachmentSize: attachment.size,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upload attachment.', error: err.message });
  }
};

export const deleteTaskAttachment = async (req, res) => {
  try {
    const existing = await TaskModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    if (existing.attachmentPath) {
      const oldPath = join(uploadDir, existing.attachmentPath.replace('/uploads/', ''));
      fs.unlink(oldPath, () => {});
    }
    await TaskModel.removeAttachment(req.params.id);
    res.status(200).json({ success: true, message: 'Attachment removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove attachment.', error: err.message });
  }
};

// Server-side aggregation for the dashboard charts: GET /api/tasks/stats?priority=High&days=7
export const getTaskStats = async (req, res) => {
  try {
    const { priority, days } = req.query;
    const stats = await TaskModel.getStats({ priority, days });
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch task statistics.', error: err.message });
  }
};
