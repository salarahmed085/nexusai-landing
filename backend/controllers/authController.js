import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const signToken = (user) =>
  jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await UserModel.getByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, errors: ['Email is already registered.'] });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const user = await UserModel.create(newUser);
    const token = signToken(user);

    res.status(201).json({ success: true, data: { token, user } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Signup failed.', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const row = await UserModel.getByEmail(normalizedEmail);
    if (!row) {
      return res.status(401).json({ success: false, errors: ['Invalid email or password.'] });
    }

    const match = await bcrypt.compare(password, row.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, errors: ['Invalid email or password.'] });
    }

    const user = { id: row.id, name: row.name, email: row.email, createdAt: row.createdAt };
    const token = signToken(user);

    res.status(200).json({ success: true, data: { token, user } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed.', error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user.', error: err.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const avatarPath = `/uploads/${req.file.filename}`;
    await UserModel.updateAvatar(req.user.id, avatarPath);

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully.',
      avatarPath,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update avatar.', error: err.message });
  }
};
