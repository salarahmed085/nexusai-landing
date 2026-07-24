import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, 'tasks.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tasks table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('Pending', 'In Progress', 'Completed')) DEFAULT 'Pending',
    priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    createdAt TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('Tasks table ready.');
    // Attachment columns for Task 1 (file upload). Added via ALTER for backward
    // compatibility with existing databases; duplicate-column errors are expected
    // and safely ignored on subsequent boots.
    const attachmentColumns = [
      'attachmentPath TEXT',
      'attachmentName TEXT',
      'attachmentType TEXT',
      'attachmentSize INTEGER',
      'projectId TEXT',
      'ticketKey TEXT',
    ];
    attachmentColumns.forEach((colDef) => {
      db.run(`ALTER TABLE tasks ADD COLUMN ${colDef}`, (alterErr) => {
        if (alterErr && !alterErr.message.includes('duplicate column')) {
          console.log('Optional tasks column addition notice:', alterErr.message);
        }
      });
    });
  }
});

// Create users table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    avatarPath TEXT
  )
`, (err) => {
  if (err) {
    console.error('Error creating users table:', err.message);
  } else {
    console.log('Users table ready.');
    // Check if column avatarPath already exists in database, otherwise add it.
    db.run("ALTER TABLE users ADD COLUMN avatarPath TEXT", (alterErr) => {
      // Ignore errors (e.g. if column already exists)
      if (alterErr && !alterErr.message.includes('duplicate column')) {
        console.log('Optional user avatarPath column addition notice:', alterErr.message);
      }
    });
    // Billing columns (Paddle). plan defaults to 'free'; the rest populate
    // once a user starts a checkout / a subscription webhook comes in.
    const billingColumns = [
      "plan TEXT NOT NULL DEFAULT 'free'",
      'paddleCustomerId TEXT',
      'paddleSubscriptionId TEXT',
      'subscriptionStatus TEXT',
      'currentPeriodEnd TEXT',
    ];
    billingColumns.forEach((colDef) => {
      db.run(`ALTER TABLE users ADD COLUMN ${colDef}`, (alterErr) => {
        if (alterErr && !alterErr.message.includes('duplicate column')) {
          console.log('Optional user billing column addition notice:', alterErr.message);
        }
      });
    });
  }
});

// Create demo_requests table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS demo_requests (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    companySize TEXT NOT NULL,
    preferredDate TEXT NOT NULL,
    interest TEXT NOT NULL,
    message TEXT NOT NULL,
    attachmentPath TEXT,
    createdAt TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Error creating demo_requests table:', err.message);
  } else {
    console.log('Demo requests table ready.');
  }
});

// Create projects table if not exists (Jira-style: each project has a short
// "key" like PROJ used to build human-readable ticket ids, e.g. PROJ-1).
db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    ticketCounter INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Error creating projects table:', err.message);
  } else {
    console.log('Projects table ready.');
  }
});

export default db;
