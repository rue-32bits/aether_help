import { Router } from 'express';
import {
  companionChat,
  dyslexiaRepair,
  dechunkTask,
  numberLens,
  decodeTone,
} from '../controllers/aiController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

// All AI endpoints are protected via authMiddleware
router.post('/companion', authMiddleware, companionChat);
router.post('/dyslexia-repair', authMiddleware, dyslexiaRepair);
router.post('/dechunk-task', authMiddleware, dechunkTask);
router.post('/number-lens', authMiddleware, numberLens);
router.post('/decode-tone', authMiddleware, decodeTone);

export default router;
