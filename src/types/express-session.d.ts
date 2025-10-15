import 'express-session';
import { Role } from '@prisma/client';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      displayName: string;
      role: Role;
    };
  }
}
