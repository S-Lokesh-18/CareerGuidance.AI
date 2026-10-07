import express from 'express';
import { z } from 'zod';
import {
  generateRoadmap,
  getRoadmapById,
  getUserRoadmaps,
  updateTaskProgress,
} from '../controllers/roadmapController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

const generateRoadmapSchema = z.object({
  careerId: z.number({ required_error: 'careerId is required' }),
  regenerate: z.boolean().optional(),
});

const updateTaskSchema = z.object({
  completed: z.boolean({ required_error: 'completed boolean is required' }),
});

router.post('/generate', validate(generateRoadmapSchema), generateRoadmap);
router.get('/', getUserRoadmaps);
router.get('/:id', getRoadmapById);
router.put('/:id/tasks/:taskId', validate(updateTaskSchema), updateTaskProgress);

export default router;
