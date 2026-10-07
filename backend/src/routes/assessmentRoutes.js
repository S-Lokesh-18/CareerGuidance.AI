import express from 'express';
import { z } from 'zod';
import {
  submitAssessment,
  getLatestAssessment,
  getUserAssessments,
} from '../controllers/assessmentController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const assessmentSchema = z.object({
  education: z.string().optional().default(''),
  interests: z.array(z.string()).optional().default([]),
  skills: z.record(z.number().min(1).max(5)).optional().default({}),
});

router.use(authenticate);

router.post('/', validate(assessmentSchema), submitAssessment);
router.get('/latest', getLatestAssessment);
router.get('/', getUserAssessments);

export default router;
