import { Response } from 'express';
import { dbStore } from '../db/database.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

export async function getPreferences(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const preferences = dbStore.getUserPreferences(req.user.id);
    return res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return res.status(500).json({ message: 'Failed to fetch preferences' });
  }
}

export async function updatePreferences(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updated = dbStore.updateUserPreferences(req.user.id, req.body);
    return res.json(updated);
  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({ message: 'Failed to update preferences' });
  }
}

// Saved Task De-chunks
export async function getTasks(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const tasks = dbStore.getTasksByUserId(req.user.id);
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tasks' });
  }
}

export async function toggleTaskStep(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { taskId, stepNumber } = req.params;
    const task = dbStore.toggleTaskStep(req.user.id, taskId, parseInt(stepNumber, 10));
    if (!task) return res.status(404).json({ message: 'Task or step not found' });
    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to toggle step' });
  }
}

export async function deleteTask(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const deleted = dbStore.deleteTask(req.user.id, id);
    if (!deleted) return res.status(404).json({ message: 'Task not found' });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete task' });
  }
}

// Saved Number Clarifications
export async function getNumberClarifications(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const list = dbStore.getNumberClarifications(req.user.id);
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch number clarifications' });
  }
}

export async function deleteNumberClarification(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const deleted = dbStore.deleteNumberClarification(req.user.id, id);
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete number clarification' });
  }
}

// Saved Tone Decodings
export async function getToneDecodings(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const list = dbStore.getToneDecodings(req.user.id);
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tone decodings' });
  }
}

export async function deleteToneDecoding(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const deleted = dbStore.deleteToneDecoding(req.user.id, id);
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete tone decoding' });
  }
}
