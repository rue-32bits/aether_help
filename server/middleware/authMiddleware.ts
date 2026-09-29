import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore, User } from '../db/database.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'aetheros_jwt_neurodivergent_secret_2026';

export interface AuthRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. Authentication token is missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = dbStore.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found or session expired.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
