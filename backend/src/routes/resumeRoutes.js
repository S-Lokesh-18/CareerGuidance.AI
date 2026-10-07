import express from 'express';
import { upload, analyzeResume, getResumeHistory, getResumeById } from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/analyze', upload.single('resume'), analyzeResume);
router.get('/history', getResumeHistory);
router.get('/:id', getResumeById);

export default router;
