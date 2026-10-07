import express from 'express';
import {
  getAllCareers,
  getCareerById,
  getCareerSkillGap,
  getCareerDemandForecast,
} from '../controllers/careerController.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllCareers);
router.get('/:id', getCareerById);
router.get('/:id/skill-gap', optionalAuthenticate, getCareerSkillGap);
router.get('/:id/forecast', getCareerDemandForecast);

export default router;
