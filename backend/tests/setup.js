import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Each test run gets its own throwaway SQLite file so tests never touch
// (or get polluted by) the real development database.
const testDbPath = join(__dirname, 'test-tasks.db');
if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
process.env.DB_PATH = testDbPath;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
