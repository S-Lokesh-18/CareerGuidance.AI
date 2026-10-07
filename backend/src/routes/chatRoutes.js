import express from 'express';
import { z } from 'zod';
import { sendMessage, getChatHistory, clearChatHistory } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

const messageSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty'),
});

router.post('/', validate(messageSchema), sendMessage);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;
