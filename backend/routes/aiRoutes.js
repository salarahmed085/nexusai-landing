import express from 'express';
import { getTaskInsights } from '../controllers/aiController.js';

const router = express.Router();

router.get('/insights', getTaskInsights);

export default router;
