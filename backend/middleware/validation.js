export const validateTask = (req, res, next) => {
  const { title, status, priority } = req.body;
  const errors = [];
  const isCreate = req.method === 'POST';

  if (isCreate) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string.');
    }
  } else if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    // On updates (PUT), title is optional — but if it's provided it must be valid.
    errors.push('Title must be a non-empty string.');
  }

  if (title && title.trim().length > 200) {
    errors.push('Title must not exceed 200 characters.');
  }

  const validStatuses = ['Pending', 'In Progress', 'Completed'];
  if (status !== undefined && !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}.`);
  }

  const validPriorities = ['Low', 'Medium', 'High'];
  if (priority !== undefined && !validPriorities.includes(priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const validateProject = (req, res, next) => {
  const { name, description } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Project name is required and must be a non-empty string.');
  }
  if (name && name.trim().length > 80) {
    errors.push('Project name must not exceed 80 characters.');
  }
  if (description && description.length > 500) {
    errors.push('Project description must not exceed 500 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};
