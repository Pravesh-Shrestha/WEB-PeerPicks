import { z } from 'zod';

export const signupDTO = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  gender: z.enum(['male', 'female']),
  age: z.coerce.number().min(13),
  phone: z.string(),
});

export const loginDTO = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});