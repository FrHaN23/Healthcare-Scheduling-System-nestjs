// src/auth/auth.schema.ts
import { z } from 'zod';

export const jwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.email(),
  iat: z.number(),
  exp: z.number(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
