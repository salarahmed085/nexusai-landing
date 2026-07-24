import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${extname(file.originalname)}`),
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, WEBP, or GIF images are allowed.'));
  }
  cb(null, true);
};

export const uploadAttachment = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('attachment');

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('avatar');

// Task attachments support a broader range of file types (images + common docs),
// not just images like avatars/demo attachments.
const ALLOWED_TASK_FILE_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-zip-compressed',
];
const MAX_TASK_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const taskFileFilter = (req, file, cb) => {
  if (!ALLOWED_TASK_FILE_TYPES.includes(file.mimetype)) {
    return cb(new Error('File type not supported. Allowed: images, PDF, Word, Excel, TXT, CSV, ZIP.'));
  }
  cb(null, true);
};

export const uploadTaskFile = multer({
  storage,
  fileFilter: taskFileFilter,
  limits: { fileSize: MAX_TASK_FILE_SIZE },
}).single('file');
