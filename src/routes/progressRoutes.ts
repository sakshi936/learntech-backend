// src/routes/progressRoutes.ts
import express from 'express';
import { 
  getProgress, 
  updateProgress, 
  getAllProgress,
  getProgressStats
} from '../controllers/progressController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = express.Router();


router.get('/all', authenticateToken, getAllProgress);

router.get('/stats', authenticateToken, getProgressStats);

router.get('/:roadmapSlug', authenticateToken, getProgress);

router.post('/:roadmapSlug', authenticateToken, updateProgress);

export default router;