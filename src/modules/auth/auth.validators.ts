import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase(),
  password: z.string().min(8, 'Mot de passe trop court'),
  displayName: z.string().min(2, 'Nom trop court'),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase(),
  password: z.string().min(8, 'Mot de passe requis'),
});
