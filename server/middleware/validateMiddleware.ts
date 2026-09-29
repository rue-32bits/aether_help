import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return res.status(400).json({ message: 'Invalid request data' });
    }
  };
}

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  full_name: z.string().min(2, 'Name must be at least 2 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updatePreferencesSchema = z.object({
  active_shell: z.enum(['standard', 'dyslexia', 'adhd', 'autism']).optional(),
  font_family: z.string().optional(),
  font_size: z.string().optional(),
  tint_overlay_enabled: z.boolean().optional(),
  tint_color: z.string().optional(),
  bionic_reading_enabled: z.boolean().optional(),
  reading_ruler_enabled: z.boolean().optional(),
  brown_noise_volume: z.number().min(0).max(1).optional(),
});
