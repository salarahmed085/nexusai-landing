import db from '../db/database.js';

class DemoRequestModel {
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM demo_requests ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static create(request) {
    return new Promise((resolve, reject) => {
      const {
        id, fullName, email, company, companySize,
        preferredDate, interest, message, attachmentPath, createdAt
      } = request;

      db.run(
        `INSERT INTO demo_requests
          (id, fullName, email, company, companySize, preferredDate, interest, message, attachmentPath, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, fullName, email, company, companySize, preferredDate, interest, message, attachmentPath, createdAt],
        function (err) {
          if (err) reject(err);
          else resolve(request);
        }
      );
    });
  }
}

export default DemoRequestModel;
