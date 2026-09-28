import { Router } from 'express';
import { chatAssistant } from '../controllers/aiController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/chat', requireAuth, chatAssistant);

export default router;
