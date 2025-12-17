import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const jwtPayload = z.object({
  sub: z.string(),
  email: z.string(),
})
