// src/routes/roadmapRoutes.ts
import express from 'express';
import { 
  getAllRoadmaps, 
  getRoadmapBySlug, 
} from '../controllers/roadmapController';

const router = express.Router();


router.get('/', getAllRoadmaps);

router.get('/:slug', getRoadmapBySlug);

export default router;