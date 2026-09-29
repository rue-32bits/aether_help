import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../db/database.ts';
import { generateToken, AuthRequest } from '../middleware/authMiddleware.ts';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, full_name } = req.body;

    const existingUser = dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = dbStore.createUser(email, passwordHash, full_name);
    const token = generateToken(newUser.id);
    const preferences = dbStore.getUserPreferences(newUser.id);

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        created_at: newUser.created_at,
      },
      preferences,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = dbStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);
    const preferences = dbStore.getUserPreferences(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
      },
      preferences,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    const preferences = dbStore.getUserPreferences(req.user.id);
    return res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.full_name,
        created_at: req.user.created_at,
      },
      preferences,
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
