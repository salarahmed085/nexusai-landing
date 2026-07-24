import db from '../db/database.js';

class ProjectModel {
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM projects ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static getByKey(key) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE key = ?', [key], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static create(project) {
    return new Promise((resolve, reject) => {
      const { id, name, key, description, color, createdAt } = project;
      db.run(
        'INSERT INTO projects (id, name, key, description, color, ticketCounter, createdAt) VALUES (?, ?, ?, ?, ?, 0, ?)',
        [id, name, key, description || '', color || '#6366f1', createdAt],
        function (err) {
          if (err) reject(err);
          else resolve({ ...project, ticketCounter: 0 });
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM projects WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes > 0 });
      });
    });
  }

  // Atomically bumps the project's ticket counter and returns the new value,
  // used to build human-readable ticket keys like "PROJ-1", "PROJ-2"...
  // sqlite3 processes commands on a connection in the order they're issued,
  // so the UPDATE-then-SELECT pair below is safe even without an explicit
  // transaction for this app's traffic level.
  static incrementCounter(id) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE projects SET ticketCounter = ticketCounter + 1 WHERE id = ?', [id], function (err) {
        if (err) return reject(err);
        db.get('SELECT ticketCounter FROM projects WHERE id = ?', [id], (err2, row) => {
          if (err2) reject(err2);
          else resolve(row?.ticketCounter);
        });
      });
    });
  }
}

export default ProjectModel;
