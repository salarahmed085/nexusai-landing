import db from '../db/database.js';

class UserModel {
  static getByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, email, createdAt, avatarPath, plan, subscriptionStatus, currentPeriodEnd FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static getByPaddleCustomerId(paddleCustomerId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE paddleCustomerId = ?', [paddleCustomerId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static getByPaddleSubscriptionId(paddleSubscriptionId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE paddleSubscriptionId = ?', [paddleSubscriptionId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Links a Paddle customer to our user the first time they start a checkout,
  // so later webhooks (which only carry the Paddle customer id) can find them.
  static setPaddleCustomerId(userId, paddleCustomerId) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET paddleCustomerId = ? WHERE id = ?', [paddleCustomerId, userId], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static updateSubscription(paddleCustomerId, { plan, paddleSubscriptionId, subscriptionStatus, currentPeriodEnd }) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users
         SET plan = ?, paddleSubscriptionId = ?, subscriptionStatus = ?, currentPeriodEnd = ?
         WHERE paddleCustomerId = ?`,
        [plan, paddleSubscriptionId, subscriptionStatus, currentPeriodEnd, paddleCustomerId],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  static updateAvatar(id, avatarPath) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET avatarPath = ? WHERE id = ?', [avatarPath, id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static create(user) {
    return new Promise((resolve, reject) => {
      const { id, name, email, passwordHash, createdAt } = user;
      db.run(
        'INSERT INTO users (id, name, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)',
        [id, name, email, passwordHash, createdAt],
        function (err) {
          if (err) reject(err);
          else resolve({ id, name, email, createdAt });
        }
      );
    });
  }
}

export default UserModel;
