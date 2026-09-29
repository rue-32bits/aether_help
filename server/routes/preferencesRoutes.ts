import { Router } from 'express';
import {
  getPreferences,
  updatePreferences,
  getTasks,
  toggleTaskStep,
  deleteTask,
  getNumberClarifications,
  deleteNumberClarification,
  getToneDecodings,
  deleteToneDecoding,
} from '../controllers/preferencesController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { validateBody, updatePreferencesSchema } from '../middleware/validateMiddleware.ts';

const router = Router();

// User preferences
router.get('/', authMiddleware, getPreferences);
router.put('/', authMiddleware, validateBody(updatePreferencesSchema), updatePreferences);

// Tasks
router.get('/tasks', authMiddleware, getTasks);
router.patch('/tasks/:taskId/step/:stepNumber/toggle', authMiddleware, toggleTaskStep);
router.delete('/tasks/:id', authMiddleware, deleteTask);

// Number Lens clarifications
router.get('/numbers', authMiddleware, getNumberClarifications);
router.delete('/numbers/:id', authMiddleware, deleteNumberClarification);

// Tone decodings
router.get('/tones', authMiddleware, getToneDecodings);
router.delete('/tones/:id', authMiddleware, deleteToneDecoding);

export default router;
