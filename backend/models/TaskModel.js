import db from '../db/database.js';

class TaskModel {
  static getAll({ projectId } = {}) {
    return new Promise((resolve, reject) => {
      const sql = projectId
        ? 'SELECT * FROM tasks WHERE projectId = ? ORDER BY createdAt DESC'
        : 'SELECT * FROM tasks ORDER BY createdAt DESC';
      const params = projectId ? [projectId] : [];
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static create(task) {
    return new Promise((resolve, reject) => {
      const { id, title, description, status, priority, createdAt, projectId, ticketKey } = task;
      db.run(
        'INSERT INTO tasks (id, title, description, status, priority, createdAt, projectId, ticketKey) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, title, description, status, priority, createdAt, projectId || null, ticketKey || null],
        function (err) {
          if (err) reject(err);
          else resolve(task);
        }
      );
    });
  }

  static update(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
      if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
      if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
      if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority); }

      if (fields.length === 0) {
        reject(new Error('No fields to update'));
        return;
      }

      values.push(id);
      const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;

      db.run(sql, values, function (err) {
        if (err) reject(err);
        else resolve({ id, ...updates });
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes > 0 });
      });
    });
  }

  // Used when a project is deleted, so its tickets don't become orphaned.
  static deleteByProjectId(projectId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE projectId = ?', [projectId], (err, rows) => {
        if (err) return reject(err);
        db.run('DELETE FROM tasks WHERE projectId = ?', [projectId], function (err2) {
          if (err2) reject(err2);
          else resolve(rows); // return deleted rows so caller can clean up attachment files
        });
      });
    });
  }

  static setAttachment(id, { path, name, type, size }) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE tasks SET attachmentPath = ?, attachmentName = ?, attachmentType = ?, attachmentSize = ? WHERE id = ?',
        [path, name, type, size, id],
        function (err) {
          if (err) reject(err);
          else resolve({ id, attachmentPath: path, attachmentName: name, attachmentType: type, attachmentSize: size });
        }
      );
    });
  }

  static removeAttachment(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE tasks SET attachmentPath = NULL, attachmentName = NULL, attachmentType = NULL, attachmentSize = NULL WHERE id = ?',
        [id],
        function (err) {
          if (err) reject(err);
          else resolve({ id, deleted: this.changes > 0 });
        }
      );
    });
  }

  // Server-side aggregation for the dashboard so the frontend never has to
  // download the full task list just to draw charts. Supports optional
  // priority and "created in the last N days" filters.
  static getStats({ priority, days } = {}) {
    return new Promise((resolve, reject) => {
      const where = [];
      const params = [];

      if (priority && priority !== 'All') {
        where.push('priority = ?');
        params.push(priority);
      }
      if (days) {
        where.push("date(createdAt) >= date('now', ?)");
        params.push(`-${Number(days) - 1} days`);
      }
      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const byStatusSql = `SELECT status, COUNT(*) as count FROM tasks ${whereClause} GROUP BY status`;
      const byPrioritySql = `SELECT priority, COUNT(*) as count FROM tasks ${whereClause} GROUP BY priority`;
      const byDateSql = `SELECT date(createdAt) as day, COUNT(*) as count FROM tasks ${whereClause} GROUP BY day ORDER BY day ASC`;
      const totalSql = `SELECT COUNT(*) as total FROM tasks ${whereClause}`;

      db.all(byStatusSql, params, (err, statusRows) => {
        if (err) return reject(err);
        db.all(byPrioritySql, params, (err2, priorityRows) => {
          if (err2) return reject(err2);
          db.all(byDateSql, params, (err3, dateRows) => {
            if (err3) return reject(err3);
            db.get(totalSql, params, (err4, totalRow) => {
              if (err4) return reject(err4);
              resolve({
                total: totalRow?.total || 0,
                byStatus: statusRows,
                byPriority: priorityRows,
                byDate: dateRows,
              });
            });
          });
        });
      });
    });
  }
}

export default TaskModel;
