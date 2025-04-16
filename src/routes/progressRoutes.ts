import express from 'express';
import { 
  getProgress, 
  updateProgress, 
  getAllProgress,
  getProgressStats,
  getRecommendations
} from '../controllers/progressController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = express.Router();


router.get('/all', authenticateToken, getAllProgress);

router.get('/stats', authenticateToken, getProgressStats);

router.get('/recommendations', authenticateToken, getRecommendations);

//dynamic routes should be in the end
router.get('/:roadmapSlug', authenticateToken, getProgress);

router.post('/:roadmapSlug', authenticateToken, updateProgress);

export default router;